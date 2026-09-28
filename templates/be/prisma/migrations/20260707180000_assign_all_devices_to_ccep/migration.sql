-- Assign every existing GPS device (and its telemetry) to the CCEP (Coca-Cola) customer tenant.
--
-- Context: the ingestion worker previously registered every live device under the placeholder
-- `default` tenant, so neither the Prowerb nor the CCEP tenant users could see them. Pilot decision:
-- all devices belong to the `coca-cola` (CCEP) tenant; the Prowerb operator tenant is granted
-- application-layer read visibility into the CCEP fleet. Future devices are assigned to `coca-cola`
-- directly by the worker (INGESTION_DEFAULT_TENANT_ID).
--
-- Idempotent: the WHERE guard makes a re-run a no-op. `coca-cola` is created by the SSO seed
-- migration, so the tenant_id foreign keys are satisfied.

UPDATE "pt_devices"         SET "tenant_id" = 'coca-cola' WHERE "tenant_id" <> 'coca-cola';
UPDATE "pt_device_status"   SET "tenant_id" = 'coca-cola' WHERE "tenant_id" <> 'coca-cola';
UPDATE "pt_positions"       SET "tenant_id" = 'coca-cola' WHERE "tenant_id" <> 'coca-cola';
UPDATE "pt_events"          SET "tenant_id" = 'coca-cola' WHERE "tenant_id" <> 'coca-cola';
UPDATE "pt_device_commands" SET "tenant_id" = 'coca-cola' WHERE "tenant_id" <> 'coca-cola';
