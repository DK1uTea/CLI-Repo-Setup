-- Entra SSO + admin approval workflow for pt_users
-- Adds authentication provider metadata (Microsoft Entra) and an approval status
-- so self-registered SSO users start as PENDING until a SUPER_ADMIN approves them.

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'ENTRA');

-- CreateEnum
CREATE TYPE "UserApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable: local (password) users no longer require a password hash (Entra users have none)
ALTER TABLE "pt_users" ALTER COLUMN "password_hash" DROP NOT NULL;

-- AlterTable: add provider + approval columns
ALTER TABLE "pt_users"
  ADD COLUMN "auth_provider"   "AuthProvider"       NOT NULL DEFAULT 'LOCAL',
  ADD COLUMN "entra_oid"       VARCHAR(64),
  ADD COLUMN "entra_tid"       VARCHAR(64),
  ADD COLUMN "approval_status" "UserApprovalStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "approved_by_id"  VARCHAR(30),
  ADD COLUMN "approved_at"     TIMESTAMP(3);

-- Backfill: every pre-existing account is a trusted local account → mark APPROVED
UPDATE "pt_users" SET "approval_status" = 'APPROVED';

-- CreateIndex
CREATE UNIQUE INDEX "pt_users_entra_oid_key" ON "pt_users"("entra_oid");

-- CreateIndex
CREATE INDEX "idx_pt_users_approval_status" ON "pt_users"("approval_status");

-- CreateIndex
CREATE INDEX "idx_pt_users_entra_tid" ON "pt_users"("entra_tid");
