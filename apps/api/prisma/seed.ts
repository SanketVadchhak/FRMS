import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Ensure Demo Company exists
  const company = await prisma.company.upsert({
    where: { id: 'demo-company-id' }, // use a fixed ID for idempotency if possible, or lookup by name
    update: {},
    create: {
      id: 'demo-company-id',
      name: 'Demo Manufacturing Co.',
      createdBy: 'SYSTEM',
      updatedBy: 'SYSTEM',
    },
  });

  console.log(`Company "${company.name}" ensured.`);

  // 2. Ensure System Permissions exist
  const allPermissions = [
    'employees:read', 'employees:write', 'employees:delete',
    'machines:read', 'machines:write', 'machines:delete',
    'designs:read', 'designs:write', 'designs:delete',
    'users:read', 'users:write', 'users:delete', 'users:manage',
    'settings:read', 'settings:write',
    'production:read', 'production:write', 'production:delete', 'production:approve', 'production:manage',
    'payroll:read', 'payroll:write',
    'notifications:manage'
  ];

  for (const perm of allPermissions) {
    await prisma.permission.upsert({
      where: { name: perm },
      update: {},
      create: { name: perm, description: `Permission for ${perm}` },
    });
  }

  const dbPerms = await prisma.permission.findMany();
  const permMap = new Map(dbPerms.map(p => [p.name, p.id]));

  const assignPermissions = async (roleId: string, permNames: string[]) => {
    for (const name of permNames) {
      const permId = permMap.get(name);
      if (permId) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId, permissionId: permId } },
          update: {},
          create: { roleId, permissionId: permId },
        });
      }
    }
  };

  const supervisorPerms = [
    'employees:read', 'machines:read', 'designs:read', 'settings:read',
    'production:read', 'production:write', 'production:delete', 'production:approve', 'production:manage',
    'payroll:read'
  ];

  const operatorPerms = [
    'employees:read', 'machines:read', 'designs:read', 'production:read', 'production:write'
  ];

  // 3. Ensure Roles and Users for Demo Company
  const adminRole = await prisma.role.upsert({
    where: { companyId_name: { name: 'Admin', companyId: company.id } },
    update: {},
    create: { name: 'Admin', companyId: company.id },
  });
  await assignPermissions(adminRole.id, allPermissions);

  const supervisorRole = await prisma.role.upsert({
    where: { companyId_name: { name: 'SUPERVISOR', companyId: company.id } },
    update: {},
    create: { name: 'SUPERVISOR', companyId: company.id },
  });
  await assignPermissions(supervisorRole.id, supervisorPerms);

  const operatorRole = await prisma.role.upsert({
    where: { companyId_name: { name: 'OPERATOR', companyId: company.id } },
    update: {},
    create: { name: 'OPERATOR', companyId: company.id },
  });
  await assignPermissions(operatorRole.id, operatorPerms);

  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { passwordHash: adminPassword },
    create: {
      username: 'admin',
      passwordHash: adminPassword,
      companyId: company.id,
      roles: { create: { roleId: adminRole.id } },
      createdBy: 'SYSTEM',
      updatedBy: 'SYSTEM',
    },
  });

  console.log(`Admin user "${adminUser.username}" and roles ensured.`);

  // 4. Create Hardik's company, roles, and user
  const hardikCompany = await prisma.company.upsert({
    where: { id: 'hardik-company-id' },
    update: {},
    create: {
      id: 'hardik-company-id',
      name: 'Hardik Enterprises',
      createdBy: 'SYSTEM',
      updatedBy: 'SYSTEM',
    },
  });

  const hardikRole = await prisma.role.upsert({
    where: { companyId_name: { name: 'Admin', companyId: hardikCompany.id } },
    update: {},
    create: { name: 'Admin', companyId: hardikCompany.id },
  });
  await assignPermissions(hardikRole.id, allPermissions);

  const hardikSupRole = await prisma.role.upsert({
    where: { companyId_name: { name: 'SUPERVISOR', companyId: hardikCompany.id } },
    update: {},
    create: { name: 'SUPERVISOR', companyId: hardikCompany.id },
  });
  await assignPermissions(hardikSupRole.id, supervisorPerms);

  const hardikOpRole = await prisma.role.upsert({
    where: { companyId_name: { name: 'OPERATOR', companyId: hardikCompany.id } },
    update: {},
    create: { name: 'OPERATOR', companyId: hardikCompany.id },
  });
  await assignPermissions(hardikOpRole.id, operatorPerms);

  const hardikPassword = await bcrypt.hash('hardik@123', 10);
  const hardikUser = await prisma.user.upsert({
    where: { username: 'Hardik' },
    update: { passwordHash: hardikPassword },
    create: {
      username: 'Hardik',
      passwordHash: hardikPassword,
      companyId: hardikCompany.id,
      roles: { create: { roleId: hardikRole.id } },
      createdBy: 'SYSTEM',
      updatedBy: 'SYSTEM',
    },
  });

  console.log(`User "${hardikUser.username}" and roles ensured for company "${hardikCompany.name}".`);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
