import { PrismaClient } from '@prisma/client';

export class AuditLogRepository {
  constructor(private prisma: PrismaClient) {}

  async list(companyId: string, limit: number = 50) {
    return this.prisma.auditLog.findMany({
      where: { companyId },
      include: {
        user: { select: { username: true } },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }
}
