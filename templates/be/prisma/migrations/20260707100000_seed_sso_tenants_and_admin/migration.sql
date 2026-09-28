-- Seed data required for Microsoft Entra SSO to work in an environment where
-- `prisma migrate deploy` runs automatically but `prisma:seed` does not.
-- Idempotent: safe to re-run.

-- 1) SSO tenants referenced by ENTRA_TENANT_MAPPINGS. Without these rows the first
--    SSO login fails on the pt_users.tenant_id foreign key.
INSERT INTO "pt_tenants" ("id", "name", "created_at", "updated_at")
VALUES
  ('prowerb',   'Prowerb',   now(), now()),
  ('coca-cola', 'Coca-Cola', now(), now())
ON CONFLICT ("id") DO NOTHING;

-- 2) Bootstrap SUPER_ADMIN so the first Microsoft login is immediately an approved
--    admin (breaks the "no admin exists to approve anyone" chicken-and-egg).
--    No password (auth_provider = ENTRA); the Entra identity links by email on first
--    sign-in. If the account already exists (e.g. a prior PENDING self-registration),
--    it is promoted instead.
INSERT INTO "pt_users"
  ("id", "email", "name", "role", "tenant_id", "is_active", "auth_provider", "approval_status", "created_at", "updated_at")
VALUES
  ('seed_pg_superadmin', 'p.goetzinger@prowerb.de', 'Philipp Goetzinger', 'SUPER_ADMIN', 'prowerb', true, 'ENTRA', 'APPROVED', now(), now())
ON CONFLICT ("email") DO UPDATE
  SET "role" = 'SUPER_ADMIN',
      "approval_status" = 'APPROVED',
      "is_active" = true,
      "updated_at" = now();
