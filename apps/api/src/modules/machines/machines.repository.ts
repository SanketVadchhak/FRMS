import { PrismaClient } from '@prisma/client';
import { MachineCreateInput, MachineUpdateInput } from '@frms/shared';

export class MachinesRepository {
  constructor(private prisma: PrismaClient) {}

  async findAllByCompany(companyId: string) {
    return this.prisma.machine.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findById(companyId: string, id: string) {
    return this.prisma.machine.findFirst({
      where: { companyId, id, deletedAt: null },
    });
  }

  async create(companyId: string, data: MachineCreateInput, createdBy: string) {
    return this.prisma.machine.create({
      data: {
        companyId,
        name: data.name,
        status: data.status,
        createdBy,
        updatedBy: createdBy,
      },
    });
  }

  async update(companyId: string, id: string, data: MachineUpdateInput, updatedBy: string) {
    return this.prisma.machine.updateMany({
      where: { companyId, id, deletedAt: null },
      data: {
        name: data.name,
        status: data.status,
        updatedBy,
      },
    });
  }

  async softDelete(companyId: string, id: string, deletedBy: string) {
    return this.prisma.machine.updateMany({
      where: { companyId, id, deletedAt: null },
      data: {
        deletedAt: new Date(),
        deletedBy,
        status: 'INACTIVE',
      },
    });
  }
}
