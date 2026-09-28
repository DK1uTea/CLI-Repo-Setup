-- Enable extensions (bundled trong timescaledb-ha image)
DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'TimescaleDB extension not available — pt_positions will be a plain table';
END $$;
CREATE EXTENSION IF NOT EXISTS postgis;

-- CreateEnum
CREATE TYPE "DeviceCommandType" AS ENUM ('REBOOT', 'SET_APN', 'SET_REPORT_INTERVAL', 'CUSTOM');

-- CreateEnum
CREATE TYPE "DeviceCommandStatus" AS ENUM ('PENDING', 'SENT', 'ACKED', 'FAILED', 'TIMEOUT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeviceCommandStage" AS ENUM ('QUEUED', 'SENT', 'ACKED', 'FAILED', 'RETRY', 'TIMEOUT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeviceProtocol" AS ENUM ('GT06', 'CANTRACK');

-- CreateEnum
CREATE TYPE "DeviceRegistrationStatus" AS ENUM ('PENDING_ACTIVATION', 'WHITELISTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('COOLER', 'VENDING_MACHINE', 'DISPENSER');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('ENTERED_GEOFENCE', 'EXITED_GEOFENCE', 'DEVICE_ONLINE', 'DEVICE_OFFLINE', 'LOW_BATTERY', 'OVERSPEED', 'VIBRATION', 'REMOVAL', 'CUSTOM');

-- CreateEnum
CREATE TYPE "GeofenceType" AS ENUM ('CIRCLE', 'POLYGON');

-- CreateEnum
CREATE TYPE "GeofenceAssignmentTargetType" AS ENUM ('DEVICE', 'TENANT_ALL');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'USER');

-- CreateTable
CREATE TABLE "pt_device_commands" (
    "id" VARCHAR(30) NOT NULL,
    "tenant_id" VARCHAR(30) NOT NULL,
    "device_id" VARCHAR(30) NOT NULL,
    "command_type" "DeviceCommandType" NOT NULL,
    "payload" JSONB,
    "status" "DeviceCommandStatus" NOT NULL DEFAULT 'PENDING',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "scheduled_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "sent_at" TIMESTAMP(3),
    "acked_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "requested_by_id" VARCHAR(30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pt_device_commands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pt_device_command_logs" (
    "id" BIGSERIAL NOT NULL,
    "command_id" VARCHAR(30) NOT NULL,
    "tenant_id" VARCHAR(30) NOT NULL,
    "device_id" VARCHAR(30) NOT NULL,
    "stage" "DeviceCommandStage" NOT NULL,
    "message" VARCHAR(500),
    "meta" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pt_device_command_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pt_devices" (
    "id" VARCHAR(30) NOT NULL,
    "imei" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "tenant_id" VARCHAR(30) NOT NULL,
    "internal_id" VARCHAR(100),
    "type" "DeviceType" NOT NULL,
    "avatar" VARCHAR(500),
    "protocol" "DeviceProtocol" NOT NULL DEFAULT 'GT06',
    "registration_status" "DeviceRegistrationStatus" NOT NULL DEFAULT 'PENDING_ACTIVATION',
    "first_seen_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pt_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pt_device_status" (
    "id" VARCHAR(30) NOT NULL,
    "device_id" VARCHAR(30) NOT NULL,
    "tenant_id" VARCHAR(30) NOT NULL,
    "battery" SMALLINT,
    "battery_voltage" DECIMAL(6,3),
    "gsm_signal" SMALLINT,
    "last_seen_at" TIMESTAMP(3),
    "last_latitude" DECIMAL(10,7),
    "last_longitude" DECIMAL(10,7),
    "last_speed_kph" DOUBLE PRECISION,
    "last_heading" INTEGER,
    "last_gps_valid" BOOLEAN,
    "last_device_time" TIMESTAMP(3),
    "last_geom" geography(Point,4326),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pt_device_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pt_events" (
    "id" BIGSERIAL NOT NULL,
    "device_id" VARCHAR(30) NOT NULL,
    "tenant_id" VARCHAR(30) NOT NULL,
    "device_time" TIMESTAMP(3) NOT NULL,
    "geofence_id" VARCHAR(30),
    "type" "EventType" NOT NULL,
    "code" VARCHAR(50),
    "message" VARCHAR(500),
    "payload" JSONB,
    "position_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pt_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pt_geofences" (
    "id" VARCHAR(30) NOT NULL,
    "tenant_id" VARCHAR(30) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" "GeofenceType" NOT NULL,
    "center_lat" DECIMAL(10,7),
    "center_lng" DECIMAL(10,7),
    "radius_m" DOUBLE PRECISION,
    "geom" geography(Geometry,4326),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pt_geofences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pt_geofence_assignments" (
    "id" VARCHAR(30) NOT NULL,
    "tenant_id" VARCHAR(30) NOT NULL,
    "geofence_id" VARCHAR(30) NOT NULL,
    "target_type" "GeofenceAssignmentTargetType" NOT NULL,
    "device_id" VARCHAR(30),
    "start_at" TIMESTAMP(3),
    "end_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pt_geofence_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pt_geofence_states" (
    "id" VARCHAR(30) NOT NULL,
    "tenant_id" VARCHAR(30) NOT NULL,
    "device_id" VARCHAR(30) NOT NULL,
    "geofence_id" VARCHAR(30) NOT NULL,
    "is_inside" BOOLEAN NOT NULL,
    "entered_at" TIMESTAMP(3),
    "exited_at" TIMESTAMP(3),
    "last_evaluated_at" TIMESTAMP(3) NOT NULL,
    "last_position_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pt_geofence_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pt_positions" (
    "id" BIGSERIAL NOT NULL,
    "device_id" VARCHAR(30) NOT NULL,
    "tenant_id" VARCHAR(30) NOT NULL,
    "device_time" TIMESTAMP(3) NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "altitude" DOUBLE PRECISION,
    "speed_kph" DOUBLE PRECISION,
    "heading" INTEGER,
    "satellites" INTEGER,
    "gps_valid" BOOLEAN NOT NULL DEFAULT true,
    "state" JSONB,
    "raw_payload" JSONB,
    "geom" geography(Point,4326),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pt_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pt_settings" (
    "id" VARCHAR(30) NOT NULL,
    "tenant_id" VARCHAR(30),
    "key" VARCHAR(100) NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by_id" VARCHAR(30),

    CONSTRAINT "pt_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pt_tenants" (
    "id" VARCHAR(30) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pt_tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pt_users" (
    "id" VARCHAR(30) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "tenant_id" VARCHAR(30) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pt_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_pt_device_commands_tenant_status_schedule" ON "pt_device_commands"("tenant_id", "status", "scheduled_at");

-- CreateIndex
CREATE INDEX "idx_pt_device_commands_device_created" ON "pt_device_commands"("device_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_pt_device_commands_status_schedule" ON "pt_device_commands"("status", "scheduled_at");

-- CreateIndex
CREATE INDEX "idx_pt_device_commands_requested_by" ON "pt_device_commands"("requested_by_id");

-- CreateIndex
CREATE INDEX "idx_pt_device_command_logs_command_created" ON "pt_device_command_logs"("command_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_pt_device_command_logs_tenant_created" ON "pt_device_command_logs"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_pt_device_command_logs_device_created" ON "pt_device_command_logs"("device_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "pt_devices_imei_key" ON "pt_devices"("imei");

-- CreateIndex
CREATE INDEX "idx_pt_devices_tenant" ON "pt_devices"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_pt_devices_imei" ON "pt_devices"("imei");

-- CreateIndex
CREATE INDEX "idx_pt_devices_registration_status" ON "pt_devices"("registration_status");

-- CreateIndex
CREATE INDEX "idx_pt_devices_tenant_status" ON "pt_devices"("tenant_id", "registration_status");

-- CreateIndex
CREATE INDEX "idx_pt_devices_type" ON "pt_devices"("type");

-- CreateIndex
CREATE UNIQUE INDEX "idx_pt_devices_tenant_internal_id" ON "pt_devices"("tenant_id", "internal_id");

-- CreateIndex
CREATE UNIQUE INDEX "pt_device_status_device_id_key" ON "pt_device_status"("device_id");

-- CreateIndex
CREATE INDEX "idx_pt_device_status_tenant" ON "pt_device_status"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_pt_device_status_last_seen" ON "pt_device_status"("last_seen_at");

-- CreateIndex
CREATE INDEX "idx_pt_events_tenant_time" ON "pt_events"("tenant_id", "device_time");

-- CreateIndex
CREATE INDEX "idx_pt_events_device_time" ON "pt_events"("device_id", "device_time");

-- CreateIndex
CREATE INDEX "idx_pt_events_geofence_time" ON "pt_events"("geofence_id", "device_time");

-- CreateIndex
CREATE INDEX "idx_pt_events_type_time" ON "pt_events"("type", "device_time");

-- CreateIndex
CREATE INDEX "idx_pt_events_time_brin" ON "pt_events" USING BRIN ("device_time");

-- CreateIndex
CREATE INDEX "idx_pt_geofences_tenant" ON "pt_geofences"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_pt_geofences_tenant_active" ON "pt_geofences"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "idx_pt_geofence_assignments_tenant_geofence" ON "pt_geofence_assignments"("tenant_id", "geofence_id");

-- CreateIndex
CREATE INDEX "idx_pt_geofence_assignments_target" ON "pt_geofence_assignments"("target_type", "device_id");

-- CreateIndex
CREATE INDEX "idx_pt_geofence_assignments_active_window" ON "pt_geofence_assignments"("is_active", "start_at", "end_at");

-- CreateIndex
CREATE INDEX "idx_pt_geofence_states_tenant_eval" ON "pt_geofence_states"("tenant_id", "last_evaluated_at");

-- CreateIndex
CREATE INDEX "idx_pt_geofence_states_device_eval" ON "pt_geofence_states"("device_id", "last_evaluated_at");

-- CreateIndex
CREATE UNIQUE INDEX "uq_pt_geofence_states_device_geofence" ON "pt_geofence_states"("device_id", "geofence_id");

-- CreateIndex
CREATE INDEX "idx_pt_positions_tenant_time" ON "pt_positions"("tenant_id", "device_time");

-- CreateIndex
CREATE INDEX "idx_pt_positions_device_time" ON "pt_positions"("device_id", "device_time");

-- CreateIndex
CREATE INDEX "idx_pt_positions_time_brin" ON "pt_positions" USING BRIN ("device_time");

-- CreateIndex
CREATE UNIQUE INDEX "idx_pt_settings_tenant_key" ON "pt_settings"("tenant_id", "key");

-- CreateIndex
CREATE UNIQUE INDEX "pt_users_email_key" ON "pt_users"("email");

-- CreateIndex
CREATE INDEX "pt_users_tenant_id_idx" ON "pt_users"("tenant_id");

-- AddForeignKey
ALTER TABLE "pt_device_commands" ADD CONSTRAINT "pt_device_commands_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "pt_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pt_device_commands" ADD CONSTRAINT "pt_device_commands_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "pt_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pt_device_commands" ADD CONSTRAINT "pt_device_commands_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "pt_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pt_device_command_logs" ADD CONSTRAINT "pt_device_command_logs_command_id_fkey" FOREIGN KEY ("command_id") REFERENCES "pt_device_commands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pt_device_command_logs" ADD CONSTRAINT "pt_device_command_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "pt_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pt_device_command_logs" ADD CONSTRAINT "pt_device_command_logs_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "pt_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pt_devices" ADD CONSTRAINT "pt_devices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "pt_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pt_device_status" ADD CONSTRAINT "pt_device_status_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "pt_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pt_device_status" ADD CONSTRAINT "pt_device_status_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "pt_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pt_events" ADD CONSTRAINT "pt_events_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "pt_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pt_events" ADD CONSTRAINT "pt_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "pt_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pt_events" ADD CONSTRAINT "pt_events_geofence_id_fkey" FOREIGN KEY ("geofence_id") REFERENCES "pt_geofences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pt_events" ADD CONSTRAINT "pt_events_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "pt_positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pt_geofences" ADD CONSTRAINT "pt_geofences_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "pt_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pt_geofence_assignments" ADD CONSTRAINT "pt_geofence_assignments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "pt_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pt_geofence_assignments" ADD CONSTRAINT "pt_geofence_assignments_geofence_id_fkey" FOREIGN KEY ("geofence_id") REFERENCES "pt_geofences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pt_geofence_assignments" ADD CONSTRAINT "pt_geofence_assignments_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "pt_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pt_geofence_states" ADD CONSTRAINT "pt_geofence_states_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "pt_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pt_geofence_states" ADD CONSTRAINT "pt_geofence_states_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "pt_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pt_geofence_states" ADD CONSTRAINT "pt_geofence_states_geofence_id_fkey" FOREIGN KEY ("geofence_id") REFERENCES "pt_geofences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pt_geofence_states" ADD CONSTRAINT "pt_geofence_states_last_position_id_fkey" FOREIGN KEY ("last_position_id") REFERENCES "pt_positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pt_positions" ADD CONSTRAINT "pt_positions_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "pt_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pt_positions" ADD CONSTRAINT "pt_positions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "pt_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pt_settings" ADD CONSTRAINT "pt_settings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "pt_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pt_users" ADD CONSTRAINT "pt_users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "pt_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── TimescaleDB Setup ────────────────────────────────────────────────────────
-- All TimescaleDB calls wrapped in DO blocks: silently skipped on plain PostgreSQL (e.g. RDS)

-- Hypertables
DO $tsdb$ BEGIN
  PERFORM create_hypertable('pt_positions',           'device_time', chunk_time_interval => INTERVAL '7 days');
  PERFORM create_hypertable('pt_events',              'device_time', chunk_time_interval => INTERVAL '7 days');
  PERFORM create_hypertable('pt_device_command_logs', 'created_at',  chunk_time_interval => INTERVAL '7 days');
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'TimescaleDB not available — tables will be plain PostgreSQL tables: %', SQLERRM;
END $tsdb$;

-- Index trên id đơn lẻ để lookup nhanh
CREATE INDEX IF NOT EXISTS idx_pt_positions_id           ON pt_positions           (id);
CREATE INDEX IF NOT EXISTS idx_pt_events_id              ON pt_events              (id);
CREATE INDEX IF NOT EXISTS idx_pt_device_command_logs_id ON pt_device_command_logs (id);

-- ── Geom trigger — auto-populate geom từ lat/lon ─────────────────────────────

-- pt_device_status: auto-populate last_geom từ last_latitude/last_longitude
CREATE OR REPLACE FUNCTION pt_device_status_set_geom()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_latitude IS NOT NULL AND NEW.last_longitude IS NOT NULL THEN
    NEW.last_geom := ST_SetSRID(
      ST_MakePoint(NEW.last_longitude::float8, NEW.last_latitude::float8),
      4326
    )::geography;
  ELSE
    NEW.last_geom := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pt_device_status_geom
  BEFORE INSERT OR UPDATE ON pt_device_status
  FOR EACH ROW EXECUTE FUNCTION pt_device_status_set_geom();

-- pt_positions: auto-populate geom từ latitude/longitude
CREATE OR REPLACE FUNCTION pt_positions_set_geom()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom := ST_SetSRID(
    ST_MakePoint(NEW.longitude::float8, NEW.latitude::float8),
    4326
  )::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pt_positions_geom
  BEFORE INSERT OR UPDATE ON pt_positions
  FOR EACH ROW EXECUTE FUNCTION pt_positions_set_geom();

-- ── RDS-native: Retention via pg_cron ──────────────────────────────────────
-- pg_cron is available on Amazon RDS PostgreSQL (requires shared_preload_libraries=pg_cron
-- in the RDS parameter group — already configured in Terraform).
-- Retention policy equivalent to TimescaleDB add_retention_policy:
--   pt_positions  → keep 3 months
--   pt_events     → keep 3 months
--   pt_device_command_logs → keep 30 days (high-volume command audit log)
DO $cron$ BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_cron;

  -- Delete GPS positions older than 3 months — runs daily at 02:00 UTC
  PERFORM cron.schedule(
    'retain-pt-positions',
    '0 2 * * *',
    $$DELETE FROM pt_positions WHERE device_time < NOW() - INTERVAL '3 months'$$
  );

  -- Delete events older than 3 months — runs daily at 02:15 UTC
  PERFORM cron.schedule(
    'retain-pt-events',
    '15 2 * * *',
    $$DELETE FROM pt_events WHERE device_time < NOW() - INTERVAL '3 months'$$
  );

  -- Delete command logs older than 30 days — runs daily at 02:30 UTC
  PERFORM cron.schedule(
    'retain-pt-device-command-logs',
    '30 2 * * *',
    $$DELETE FROM pt_device_command_logs WHERE created_at < NOW() - INTERVAL '30 days'$$
  );

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron not available — retention jobs not scheduled (extension may need shared_preload_libraries configuration): %', SQLERRM;
END $cron$;

-- ── SEEDING ───────────────────────────────────────────────────────────────
INSERT INTO pt_tenants (id, name, updated_at) VALUES ('default', 'Default Tenant', CURRENT_TIMESTAMP)
  ON CONFLICT (id) DO NOTHING;
