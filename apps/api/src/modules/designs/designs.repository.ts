import { PrismaClient } from '@prisma/client';
import { DesignCreateInput, DesignUpdateInput } from '@frms/shared';

export class DesignsRepository {
  constructor(private prisma: PrismaClient) {}

  async findAllByCompany(companyId: string) {
    return this.prisma.design.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findById(companyId: string, id: string) {
    return this.prisma.design.findFirst({
      where: { companyId, id, deletedAt: null },
    });
  }

  async create(companyId: string, data: DesignCreateInput, createdBy: string) {
    return this.prisma.design.create({
      data: {
        companyId,
        code: data.code,
        name: data.name,
        status: data.status,
        createdBy,
        updatedBy: createdBy,
      },
    });
  }

  async update(companyId: string, id: string, data: DesignUpdateInput, updatedBy: string) {
    return this.prisma.design.updateMany({
      where: { companyId, id, deletedAt: null },
      data: {
        code: data.code,
        name: data.name,
        status: data.status,
        updatedBy,
      },
    });
  }

  async softDelete(companyId: string, id: string, deletedBy: string) {
    return this.prisma.design.updateMany({
      where: { companyId, id, deletedAt: null },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }
}
