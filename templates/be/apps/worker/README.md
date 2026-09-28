# worker

App xử lý async job từ BullMQ queue — nhận `GpsJobData` do `tcp-server` publish, lưu position vào database.

---

## Trách nhiệm

1. **Lắng nghe queue `gps`** — consume job `gps-packet` từ BullMQ.
2. **Validate thiết bị** — lookup IMEI trong database, bỏ qua nếu chưa đăng ký.
3. **Lưu position** vào `pt_positions` (TimescaleDB hypertable).
4. **Log lỗi** job failed mà không crash process.

App chạy không có HTTP — dùng `NestFactory.createApplicationContext`.

---

## Luồng xử lý

```
BullMQ Queue "gps"
    │ job "gps-packet" (GpsJobData)
    ▼
GpsProcessor.process(job)
    │
    ├── type !== 'location' && type !== 'gps'  →  skip (heartbeat, lbs, alarm, ack)
    ├── lat hoặc lon thiếu                     →  skip
    │
    ├── devicesRepo.findByImei(imei)
    │   └── không tìm thấy  →  warn + skip
    │
    └── positionsRepo.createOne({
            deviceId, tenantId,
            deviceTime, latitude, longitude,
            speedKph, heading, satellites,
            gpsValid, rawPayload
        })
```

---

## GpsProcessor

`@Processor(GPS_QUEUE)` — NestJS BullMQ processor, extends `WorkerHost`.

**Chỉ xử lý** packet có `type === 'location'` (GT06) hoặc `type === 'gps'` (CANTRACK) và có tọa độ hợp lệ. Các type khác (`heartbeat`, `lbs`, `alarm`, `ack`, `unknown`) được bỏ qua.

**Mapping field:**

| GpsJobData field | pt_positions column | Ghi chú |
|---|---|---|
| `ts` | `deviceTime` | ISO string → Date |
| `lat` | `latitude` | parseFloat |
| `lon` | `longitude` | parseFloat |
| `speed` | `speedKph` | parseFloat |
| `course` | `heading` | parseInt |
| `sats` | `satellites` | parseInt |
| `gpsOk` | `gpsValid` | `!== 'false'` (default true) |
| `raw` | `rawPayload.raw` | Lưu raw hex/ASCII để debug |

`tenantId` lấy từ `device.tenantId` — đảm bảo tenant isolation tại tầng repository.

---

## Modules

```
WorkerModule
├── ConfigModule       (redisConfiguration, Joi validation)
├── BullModule         (connect Redis)
├── PrismaModule       (via @app/third-party)
└── GPSModule
    ├── DevicesDataModule    (IDevicesRepository — lookup by IMEI)
    ├── PositionsDataModule  (IPositionsRepository — createOne)
    ├── BullModule.registerQueue(GPS_QUEUE)
    └── GpsProcessor
```

---

## Cấu hình

| Env | Mô tả |
|---|---|
| `REDIS_HOST` | Redis host (BullMQ) |
| `REDIS_PORT` | Redis port |
| `REDIS_PASSWORD` | Redis password (optional) |
| `REDIS_DB` | Redis DB index |
| `DATABASE_URL` | PostgreSQL connection string (Prisma) |

---

## Mở rộng

Để thêm xử lý cho loại event khác (heartbeat, alarm...), tạo thêm processor trong `apps/worker/src/modules/gps/processors/` và đăng ký trong `GPSModule`. Mỗi processor nên có `@Processor(QUEUE_NAME)` riêng hoặc handle thêm type trong `GpsProcessor.process()`.
