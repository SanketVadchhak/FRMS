import { PrismaClient } from '@prisma/client';
import { EmployeeCreateInput, EmployeeUpdateInput } from '@frms/shared';

export class EmployeesRepository {
  constructor(private prisma: PrismaClient) {}

  async findAllByCompany(companyId: string) {
    return this.prisma.employee.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findById(companyId: string, id: string) {
    return this.prisma.employee.findFirst({
      where: { companyId, id, deletedAt: null },
    });
  }

  async create(companyId: string, data: EmployeeCreateInput, createdBy: string) {
    return this.prisma.employee.create({
      data: {
        companyId,
        name: data.name,
        mobile: data.mobile,
        joiningDate: new Date(data.joiningDate),
        hourlyRate: data.hourlyRate,
        status: data.status,
        notes: data.notes,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        ifscCode: data.ifscCode,
        createdBy,
        updatedBy: createdBy,
      },
    });
  }

  async update(companyId: string, id: string, data: EmployeeUpdateInput, updatedBy: string) {
    return this.prisma.employee.updateMany({
      where: { companyId, id, deletedAt: null },
      data: {
        name: data.name,
        mobile: data.mobile,
        joiningDate: data.joiningDate ? new Date(data.joiningDate) : undefined,
        hourlyRate: data.hourlyRate,
        status: data.status,
        notes: data.notes,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        ifscCode: data.ifscCode,
        updatedBy,
      },
    });
  }

  async softDelete(companyId: string, id: string, deletedBy: string) {
    return this.prisma.employee.updateMany({
      where: { companyId, id, deletedAt: null },
      data: {
        deletedAt: new Date(),
        deletedBy,
        status: 'INACTIVE', // ensure it becomes inactive
      },
    });
  }
}
