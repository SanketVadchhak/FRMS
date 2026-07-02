import { PrismaClient } from '@prisma/client';

export class UsersRepository {
  constructor(private prisma: PrismaClient) {}

  async findAllByCompany(companyId: string) {
    return this.prisma.user.findMany({
      where: { companyId, deletedAt: null },
      select: {
        id: true,
        username: true,
        status: true,
        createdAt: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async findById(companyId: string, id: string) {
    return this.prisma.user.findFirst({
      where: { companyId, id, deletedAt: null },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async create(data: { companyId: string; username: string; passwordHash: string; status: string }) {
    return this.prisma.user.create({
      data,
    });
  }

  async assignRole(userId: string, roleId: string) {
    return this.prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
    });
  }

  async softDelete(companyId: string, id: string, deletedBy: string) {
    return this.prisma.user.updateMany({
      where: { id, companyId },
      data: {
        deletedAt: new Date(),
        deletedBy,
        status: 'INACTIVE',
      },
    });
  }

  // Helper to find a role by name
  async findRoleByName(companyId: string, name: string) {
    return this.prisma.role.findUnique({
      where: { companyId_name: { companyId, name } },
    });
  }
}
