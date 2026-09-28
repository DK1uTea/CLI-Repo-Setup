ALTER TABLE "pt_positions"
ADD COLUMN "address" VARCHAR(500);

ALTER TABLE "pt_device_status"
ADD COLUMN "last_address" VARCHAR(500);