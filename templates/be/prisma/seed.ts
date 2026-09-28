import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { AuthProvider, PrismaClient, UserApprovalStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to run seed');
}

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const tenantName = process.env.SEED_TENANT_NAME ?? 'Default Tenant';
  const adminEmail = process.env.SEED_SUPER_ADMIN_EMAIL ?? 'admin@example.com';
  const adminName = process.env.SEED_SUPER_ADMIN_NAME ?? 'Super Admin';
  const adminPassword = process.env.SEED_SUPER_ADMIN_PASSWORD ?? 'Admin@123456';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const tenant = await prisma.tenant.upsert({
    where: { id: 'default' },
    update: { name: tenantName },
    create: {
      id: 'default',
      name: tenantName,
    },
  });

  // Example tenant mapping for Entra SSO
  const ssoTenants: Array<{ id: string; name: string }> = [
    { id: 'tenant-a', name: 'Organization A' },
    { id: 'tenant-b', name: 'Organization B' },
  ];
  for (const t of ssoTenants) {
    await prisma.tenant.upsert({
      where: { id: t.id },
      update: { name: t.name },
      create: { id: t.id, name: t.name },
    });
  }

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      role: UserRole.SUPER_ADMIN,
      tenantId: tenant.id,
      isActive: true,
      passwordHash,
      authProvider: AuthProvider.LOCAL,
      approvalStatus: UserApprovalStatus.APPROVED,
    },
    create: {
      email: adminEmail,
      name: adminName,
      role: UserRole.SUPER_ADMIN,
      tenantId: tenant.id,
      isActive: true,
      passwordHash,
      authProvider: AuthProvider.LOCAL,
      approvalStatus: UserApprovalStatus.APPROVED,
    },
  });

  console.log('Seed completed successfully!');
  console.log(`Default tenant: ${tenant.name} (id: ${tenant.id})`);
  console.log(`Super admin user: ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
