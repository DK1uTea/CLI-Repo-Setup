# tcp-server

App nhận dữ liệu thô từ thiết bị GPS qua kết nối TCP, parse packet, và đẩy job vào BullMQ queue để worker xử lý tiếp.

---

## Trách nhiệm

1. **Mở TCP server** trên 2 port (cấu hình qua `TCP_PORT_1`, `TCP_PORT_2`).
2. **Quản lý session** mỗi kết nối — buffer dữ liệu, detect protocol, parse packet.
3. **ACK ngay** các packet yêu cầu theo spec để thiết bị không retry.
4. **Publish job** `gps-packet` vào BullMQ queue `gps` — worker xử lý async.
5. Expose **HTTP `/health`** (port `HEALTH_HTTP_PORT`, mặc định 8080) cho Docker/load balancer.

App chạy **không có HTTP NestJS** — dùng `NestFactory.createApplicationContext`.

---

## Luồng dữ liệu

```
Thiết bị GPS
    │ TCP connect
    ▼
TcpIngestionService (onApplicationBootstrap)
    │ net.createServer — mỗi socket → new Session(...)
    ▼
Session (per-connection, plain class)
    │ buffer nhận data từng chunk
    │ drain() — detect protocol qua byte đầu tiên:
    │   0x78 0x78  → GT06 binary
    │   0x2a (*)   → CANTRACK ASCII
    ▼
Parser
    │ parseGT06(buf)  hoặc  parseCAN(line)
    ▼
handleGT06 / handleCAN
    │ Ghi IMEI vào session, update SessionRegistry
    │ Gửi ACK ngay về thiết bị (nếu cần)
    ▼
onEvent callback → eventToJobData()
    ▼
BullMQ Queue "gps"  →  worker xử lý tiếp
```

---

## Protocols

### GT06 (binary)

Frame: `0x78 0x78 | LEN | PROTO | DATA | CRC_HI CRC_LO | 0x0D 0x0A`

| Protocol byte | Loại packet | Hành động |
|---|---|---|
| `0x01` | Login | Parse IMEI (BCD 8 bytes), gửi `loginAck`, register session |
| `0x12` / `0x22` | Location | Parse lat/lon/speed/course/sats, gửi job |
| `0x13` | Heartbeat | Gửi `heartbeatAck`, update lastSeen |
| `0x16` | Alarm | Gửi job (timestamp only) |

Tọa độ: `rawInt / 1_800_000`, dấu xác định từ bits N/S/E/W trong course flags.

### CANTRACK (ASCII)

Frame: `*HQ,<IMEI>,<CMD>,[fields...]#`

| Command | Loại | Hành động |
|---|---|---|
| `HTBT` | Heartbeat | Gửi `*HQ,IMEI,HTBT,battery#` |
| `ICCID` | SIM query | Gửi `*HQ,IMEI,ICCID#` |
| `V1` | GPS location | Parse lat/lon/speed/course/equ_status, gửi job |
| `V3` | LBS (cell tower) | Gửi job (không có GPS coord) |
| `V4` | Confirm + GPS | Tương tự V1, bỏ 2 field đầu |
| `V5` | WiFi positioning | Treat như heartbeat |

Speed CANTRACK đơn vị knots → convert sang km/h (`× 1.852`).
`equ_status` 4-byte hex encode: removal, vibration, lowBattery, overspeed, fenceIn, fenceOut.

---

## Session Management

`SessionRegistry` (NestJS singleton) giữ in-memory map:

```
IMEI → { connectedAt, lastSeen }
```

- `register(imei)` — khi thiết bị login
- `update(imei)` — mỗi heartbeat hoặc location packet
- `unregister(imei)` — khi socket đóng

Timeout mặc định: **5 phút** không nhận data → socket bị destroy.
Buffer overflow (> 4096 bytes mà không parse được): reset buffer.

---

## GpsJobData — format đưa vào queue

Tất cả field là `string` để đồng nhất serialization. Worker tự parse lại.

```typescript
{
  imei: string;
  src: 'gt06' | 'cantrack';
  type: string;       // 'location' | 'gps' | 'heartbeat' | 'lbs' | 'alarm' | 'unknown'
  ts: string;         // ISO string — device time nếu có, fallback server time
  lat?: string;
  lon?: string;
  speed?: string;
  course?: string;
  sats?: string;
  gpsOk?: string;
  battery?: string;   // CANTRACK only
  equStatus?: string; // CANTRACK only — JSON.stringify(EquStatus)
  raw: string;        // hex (GT06) hoặc ASCII (CANTRACK)
}
```

Job config: `removeOnComplete: true`, `removeOnFail: 10` (giữ 10 job fail gần nhất để debug).

---

## Cấu hình

| Env | Mặc định | Mô tả |
|---|---|---|
| `TCP_PORT_1` | — | Port TCP thứ nhất (required) |
| `TCP_PORT_2` | — | Port TCP thứ hai (required) |
| `HEALTH_HTTP_PORT` | `8080` | Port HTTP health check |
| `REDIS_HOST` | — | Redis host (BullMQ) |
| `REDIS_PORT` | — | Redis port |
| `REDIS_PASSWORD` | — | Redis password (optional) |
| `REDIS_DB` | — | Redis DB index |

---

## Modules

```
TcpServerModule
├── ConfigModule          (tcpConfiguration + redisConfiguration, Joi validation)
├── BullModule            (connect Redis)
├── PrismaModule          (via @app/third-party — chưa dùng trực tiếp)
├── SessionModule
│   └── SessionRegistry   (in-memory session map)
└── TcpIngestionModule
    ├── SessionModule
    ├── BullModule.registerQueue(GPS_QUEUE)
    └── TcpIngestionService
```
