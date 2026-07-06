import { PrismaClient } from '@prisma/client';

export class PayrollRepository {
  constructor(private prisma: PrismaClient) {}

  async findAllByCompany(companyId: string) {
    return this.prisma.payroll.findMany({
      where: { companyId, deletedAt: null },
      include: {
        employee: true,
      },
      orderBy: { periodStart: 'desc' },
    });
  }

  async findById(companyId: string, id: string) {
    return this.prisma.payroll.findFirst({
      where: { companyId, id, deletedAt: null },
      include: {
        employee: true,
      },
    });
  }

  // A transaction for generating a payroll and marking advances as deducted
  async generatePayroll(
    companyId: string,
    data: any, // Using any for now to bypass strict mapping issues while prototyping
    createdBy: string,
    advanceIdsToDeduct: string[]
  ) {
    return this.prisma.$transaction(async (tx: any) => {
      // 1. Create the Payroll Record
      const payroll = await tx.payroll.create({
        data: {
          companyId,
          employeeId: data.employeeId,
          periodStart: new Date(data.payrollPeriodStart),
          periodEnd: new Date(data.payrollPeriodEnd),
          basicWage: data.basicWage || 0,
          bonus: data.bonus || 0,
          grossWage: data.grossPay || 0,
          advanceDeducted: data.totalDeductions || 0,
          netPay: data.netPay || 0,
          status: data.status === 'PAID' ? 'PAID' : 'PENDING',
          createdBy,
          updatedBy: createdBy,
        },
      });

      // 2. Link and mark advances as deducted
      if (advanceIdsToDeduct.length > 0) {
        await tx.salaryAdvance.updateMany({
          where: {
            id: { in: advanceIdsToDeduct },
          },
          data: {
            deducted: true,
            payrollId: payroll.id,
          },
        });
      }

      return payroll;
    });
  }

  async generateBatch(companyId: string, entries: any[], createdBy: string) {
    return this.prisma.$transaction(async (tx: any) => {
      let createdCount = 0;
      
      for (const data of entries) {
        // 1. Create the Payroll Record
        const payroll = await tx.payroll.create({
          data: {
            companyId,
            employeeId: data.employeeId,
            periodStart: new Date(data.payrollPeriodStart),
            periodEnd: new Date(data.payrollPeriodEnd),
            basicWage: data.basicWage || 0,
            bonus: data.bonus || 0,
            grossWage: data.grossPay || 0,
            advanceDeducted: data.totalDeductions || 0,
            netPay: data.netPay || 0,
            status: data.status === 'PAID' ? 'PAID' : 'PENDING',
            createdBy,
            updatedBy: createdBy,
          },
        });

        // 2. Link any unpaid advances that match this employee and fall within this period
        await tx.salaryAdvance.updateMany({
          where: {
            employeeId: data.employeeId,
            deducted: false,
            date: { lte: new Date(data.payrollPeriodEnd) }
          },
          data: {
            deducted: true,
            payrollId: payroll.id,
          },
        });
        
        createdCount++;
      }
      
      return createdCount;
    });
  }

  async markAsPaid(companyId: string, id: string, paymentMethod: string, updatedBy: string) {
    return this.prisma.payroll.updateMany({
      where: { companyId, id, deletedAt: null },
      data: {
        status: 'PAID',
        paymentMethod,
        paymentDate: new Date(),
        updatedBy,
      },
    });
  }
}
