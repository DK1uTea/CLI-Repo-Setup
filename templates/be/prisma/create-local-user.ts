import 'dotenv/config';

import { randomBytes } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { AuthProvider, PrismaClient, UserApprovalStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';

/**
 * Creates a LOCAL (password) user — the fallback for people whose Microsoft tenant
 * requires local fallback account.
 *
 * Usage:
 *   pnpm user:create -- --email admin@example.com --name "Admin User" --tenant default
 *   pnpm user:create -- --email … --tenant default --role ADMIN --password "…"
 *   pnpm user:create -- --email … --tenant default --reset-password
 *
 * Omit --password to have a strong one generated and printed once.
 */

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required to create a user');
}

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const args: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      i++;
    } else {
      args[key] = true;
    }
  }
  return args;
}

/** URL-safe random password (~128 bits of entropy). */
function generatePassword(): string {
  return randomBytes(18).toString('base64url');
}

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const email = typeof args.email === 'string' ? args.email.trim().toLowerCase() : '';
  const tenantId = typeof args.tenant === 'string' ? args.tenant.trim() : '';
  const name = typeof args.name === 'string' ? args.name : email;
  const roleArg = typeof args.role === 'string' ? args.role.toUpperCase() : 'USER';
  const resetPassword = args['reset-password'] === true;

  if (!email || !email.includes('@')) {
    throw new Error('--email <address> is required');
  }
  if (!tenantId) {
    throw new Error('--tenant <tenantId> is required (e.g. default, tenant-a, default)');
  }
  if (!(roleArg in UserRole)) {
    throw new Error(`--role must be one of: ${Object.keys(UserRole).join(', ')}`);
  }
  const role = UserRole[roleArg as keyof typeof UserRole];

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    const available = await prisma.tenant.findMany({ select: { id: true } });
    throw new Error(
      `Tenant "${tenantId}" not found. Available: ${available.map((t) => t.id).join(', ')}`,
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && !resetPassword) {
    throw new Error(
      `User ${email} already exists (authProvider=${existing.authProvider}). ` +
        'Re-run with --reset-password to set a new password.',
    );
  }

  const password = typeof args.password === 'string' ? args.password : generatePassword();
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    // Only touch credentials/approval on update — leave name, role and tenant as the
    // admins last set them unless this is a fresh account.
    update: {
      passwordHash,
      isActive: true,
      approvalStatus: UserApprovalStatus.APPROVED,
    },
    create: {
      email,
      name,
      role,
      tenantId,
      passwordHash,
      isActive: true,
      authProvider: AuthProvider.LOCAL,
      approvalStatus: UserApprovalStatus.APPROVED,
    },
  });

  console.log('');
  console.log(existing ? 'Password reset for existing user:' : 'Created LOCAL user:');
  console.log(`  email:    ${user.email}`);
  console.log(`  name:     ${user.name}`);
  console.log(`  role:     ${user.role}`);
  console.log(`  tenant:   ${user.tenantId}`);
  console.log(`  password: ${password}`);
  console.log('');
  console.log('Share this password over a secure channel and have the user change it.');
  console.log('');
}

main()
  .catch((error) => {
    console.error(`\n${error instanceof Error ? error.message : error}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
