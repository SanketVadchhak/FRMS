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

  // 2. Ensure Admin User exists for this company
  // The user requested: "create one more credential for diffrent comapny admin name Hardik and password hardik@123"
  // Wait, the user previously requested a completely new account with no old data. Let's make the admin user for this company.
  
  const adminEmail = 'admin@demo.com';
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const adminRole = await prisma.role.upsert({
    where: { companyId_name: { name: 'Admin', companyId: company.id } },
    update: {},
    create: {
      name: 'Admin',
      companyId: company.id,
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      passwordHash: adminPassword, // Ensure password is correct
    },
    create: {
      username: 'admin',
      passwordHash: adminPassword,
      companyId: company.id,
      roles: {
        create: {
          roleId: adminRole.id,
        },
      },
      createdBy: 'SYSTEM',
      updatedBy: 'SYSTEM',
    },
  });

  console.log(`Admin user "${adminUser.username}" ensured.`);

  // Create Hardik's company and user as requested
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

  const hardikPassword = await bcrypt.hash('hardik@123', 10);
  
  const hardikRole = await prisma.role.upsert({
    where: { companyId_name: { name: 'Admin', companyId: hardikCompany.id } },
    update: {},
    create: {
      name: 'Admin',
      companyId: hardikCompany.id,
    },
  });

  const hardikUser = await prisma.user.upsert({
    where: { username: 'Hardik' },
    update: {
      passwordHash: hardikPassword,
    },
    create: {
      username: 'Hardik',
      passwordHash: hardikPassword,
      companyId: hardikCompany.id,
      roles: {
        create: {
          roleId: hardikRole.id,
        },
      },
      createdBy: 'SYSTEM',
      updatedBy: 'SYSTEM',
    },
  });

  console.log(`User "${hardikUser.username}" ensured for company "${hardikCompany.name}".`);

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
