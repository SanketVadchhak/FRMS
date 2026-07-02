import { PrismaClient } from '@prisma/client';

export class SettingsRepository {
  constructor(private prisma: PrismaClient) {}

  async getSettings(companyId: string) {
    return this.prisma.companySettings.findUnique({
      where: { companyId },
    });
  }

  async upsertSettings(companyId: string, data: any, updatedBy: string) {
    return this.prisma.companySettings.upsert({
      where: { companyId },
      update: {
        ...data,
        updatedBy,
      },
      create: {
        companyId,
        ...data,
        createdBy: updatedBy,
        updatedBy,
      },
    });
  }
}
