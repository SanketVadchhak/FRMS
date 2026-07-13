import { PrismaClient } from '@prisma/client';
import { ProductionEntry as SharedProductionEntry } from '@frms/shared';

export class ProductionRepository {
  constructor(private prisma: PrismaClient) {}

  async findAllByCompany(companyId: string) {
    return this.prisma.productionEntry.findMany({
      where: { companyId, deletedAt: null },
      include: {
        employee: true,
        machine: true,
        details: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async findById(companyId: string, id: string) {
    return this.prisma.productionEntry.findFirst({
      where: { companyId, id, deletedAt: null },
      include: {
        employee: true,
        machine: true,
        details: true,
      },
    });
  }

  async createWithDetails(companyId: string, data: SharedProductionEntry, createdBy: string) {
    // We use a transaction to ensure entry and details are created together
    return this.prisma.$transaction(async (tx: any) => {
      const entry = await tx.productionEntry.create({
        data: {
          companyId,
          date: new Date(data.date),
          employeeId: data.employeeId,
          machineId: data.machineId,
          shift: data.shift,
          framesChanged: data.framesChanged,
          threadBreakage: data.threadBreakage,
          bonus: data.bonus,
          notes: data.notes,
          productionQuantity: data.productionQuantity,
          hoursWorked: data.hoursWorked,
          status: data.status,
          createdBy,
          updatedBy: createdBy,
          details: {
            create: data.details.map((d) => ({
              designName: d.designName,
              totalStitches: d.totalStitches,
            })),
          },
        },
        include: {
          details: true,
        },
      });

      // Automatically create a Payment record for Upad (Daily Advance) if provided
      if (data.upadAmount && data.upadAmount > 0) {
        await tx.payment.create({
          data: {
            companyId,
            employeeId: data.employeeId,
            date: new Date(data.date),
            amount: data.upadAmount,
            type: 'ADVANCE',
            effect: 'DEDUCTION',
            status: 'PENDING',
            reason: 'Daily Upad - Auto-generated from Production Entry',
            createdBy,
            updatedBy: createdBy,
          }
        });
      }

      return entry;
    });
  }

  async updateWithDetails(companyId: string, id: string, data: SharedProductionEntry, updatedBy: string) {
    return this.prisma.$transaction(async (tx: any) => {
      // Delete existing details first
      await tx.productionDetail.deleteMany({
        where: { productionEntryId: id },
      });

      // Update entry and recreate details
      const entry = await tx.productionEntry.update({
        where: { id },
        data: {
          date: new Date(data.date),
          employeeId: data.employeeId,
          machineId: data.machineId,
          shift: data.shift,
          framesChanged: data.framesChanged,
          threadBreakage: data.threadBreakage,
          bonus: data.bonus,
          notes: data.notes,
          productionQuantity: data.productionQuantity,
          hoursWorked: data.hoursWorked,
          status: data.status,
          updatedBy,
          details: {
            create: data.details.map((d) => ({
              designName: d.designName,
              totalStitches: d.totalStitches,
            })),
          },
        },
        include: {
          details: true,
        },
      });

      return entry;
    });
  }

  async softDelete(companyId: string, id: string, deletedBy: string) {
    return this.prisma.productionEntry.updateMany({
      where: { companyId, id, deletedAt: null },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }

  async updateStatus(companyId: string, id: string, status: string, rejectionReason?: string, approvedBy?: string) {
    return this.prisma.productionEntry.updateMany({
      where: { companyId, id, deletedAt: null },
      data: {
        status,
        rejectionReason: rejectionReason || null,
        approvedBy: approvedBy || null,
        approvedAt: approvedBy ? new Date() : null,
      },
    });
  }

  async bulkUpdateStatus(companyId: string, ids: string[], status: string, approvedBy: string) {
    return this.prisma.productionEntry.updateMany({
      where: { companyId, id: { in: ids }, deletedAt: null },
      data: {
        status,
        approvedBy,
        approvedAt: new Date(),
        rejectionReason: null,
      },
    });
  }
}
