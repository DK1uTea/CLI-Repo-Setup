-- Local (password) account for CCEP.
--
-- Why a migration and not the seed script: `prisma migrate deploy` runs automatically
-- in the container at startup (see docker-entrypoint.sh), while `prisma:seed` does not,
-- and the RDS instance sits in a private subnet that is unreachable from outside the VPC.
-- This mirrors 20260707100000_seed_sso_tenants_and_admin.
--
-- Why a password account and not SSO: the CCEP Microsoft tenant withholds admin consent
-- for the ProTrack app registration, so the Entra sign-in can never complete for
-- @ccep.com users. auth_provider = LOCAL routes them through POST /auth/login instead.
--
-- Idempotent: safe to re-run. The password hash is bcrypt (cost 10); the account is
-- expected to change its password after first sign-in.

-- Tenant is normally already present from 20260707100000, repeated here so this
-- migration does not depend on that one having succeeded.
INSERT INTO "pt_tenants" ("id", "name", "created_at", "updated_at")
VALUES ('coca-cola', 'Coca-Cola', now(), now())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "pt_users"
  ("id", "email", "name", "role", "tenant_id", "is_active", "password_hash", "auth_provider", "approval_status", "created_at", "updated_at")
VALUES
  (
    'seed_ccep_alaub',
    'alaub@ccep.com',
    'Andreas Laub',
    'USER',
    'coca-cola',
    true,
    '$2b$10$6pEVAyuRZjUBGm5U4UZ59ujKPfxPeLgTPnakOBOpHwy8HIKeXyDQ6',
    'LOCAL',
    'APPROVED',
    now(),
    now()
  )
ON CONFLICT ("email") DO UPDATE
  SET "password_hash"   = EXCLUDED."password_hash",
      "approval_status" = 'APPROVED',
      "is_active"       = true,
      "updated_at"      = now();
