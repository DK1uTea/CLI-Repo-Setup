import { DeviceProtocol } from '@prisma/client';
import type { GT06Packet, LocationPkt, LoginPkt } from './types';

// Protocol byte constants
const PROTO = {
  LOGIN: 0x01,
  LOC: 0x12,
  LOC_V3: 0x22,
  HB: 0x13,
  ALARM: 0x16,
} as const;

// GT06 packet layout:
//   [0x78][0x78] | [LEN] | [PROTO] | [...DATA...] | [CRC_HI][CRC_LO] | [0x0D][0x0A]
const MIN_LEN = 10;
const START_1 = 0x78;
const END_CR = 0x0d;
const END_LF = 0x0a;

export function parseGT06(buf: Buffer): GT06Packet | null {
  if (buf.length < MIN_LEN) return null;
  if (buf[0] !== START_1) return null;
  if (buf[1] !== START_1) return null;
  if (buf.at(-2) !== END_CR) return null;
  if (buf.at(-1) !== END_LF) return null;

  const proto = buf[3];
  // Serial number luôn nằm ở 2 bytes trước CRC (4 bytes cuối trước end bytes)
  const serial = buf.readUInt16BE(buf.length - 6);
  const base = { proto: DeviceProtocol.GT06, serial, raw: buf };

  switch (proto) {
    case PROTO.LOGIN:
      return parseLogin(buf, base);
    case PROTO.LOC:
    case PROTO.LOC_V3:
      return parseLoc(buf, base);
    case PROTO.HB:
      return { ...base, type: 'heartbeat' };
    case PROTO.ALARM:
      return { ...base, type: 'alarm', ts: readTs(buf, 4) };
    default:
      return { ...base, type: 'unknown', protocol: proto };
  }
}

function parseLogin(buf: Buffer, base: object): LoginPkt {
  // 8 bytes BCD IMEI bắt đầu từ offset 4
  const imei = decodeBCD(buf.slice(4, 12));
  return { ...base, type: 'login', imei } as LoginPkt;
}

function parseLoc(buf: Buffer, base: object): LocationPkt {
  const ts = readTs(buf, 4); // offset 4: 6 bytes timestamp
  const latRaw = buf.readUInt32BE(10); // offset 10: latitude
  const lonRaw = buf.readUInt32BE(14); // offset 14: longitude
  const speed = buf[18]; // offset 18: speed (km/h)
  const cf = buf.readUInt16BE(19); // offset 19: course + flags

  // bits [15:6] = course (10 bits, 0-360°)
  // bit  [3]    = gps valid
  // bit  [2]    = 1=North / 0=South
  // bit  [1]    = 1=East  / 0=West
  const course = (cf >> 6) & 0x3ff;
  const gpsOk = Boolean((cf >> 3) & 1);
  const isN = Boolean((cf >> 2) & 1);
  const isE = Boolean((cf >> 1) & 1);
  // Satellite count ẩn trong 4 bits cao của byte latitude đầu tiên
  const sats = (buf[10] >> 4) & 0x0f;

  return {
    ...base,
    type: 'location',
    ts,
    lat: (latRaw / 1_800_000) * (isN ? 1 : -1),
    lon: (lonRaw / 1_800_000) * (isE ? 1 : -1),
    speed,
    course,
    sats,
    gpsOk,
  } as LocationPkt;
}

// Đọc 6 bytes timestamp GT06 (YY MM DD HH MM SS UTC) từ offset bất kỳ
function readTs(buf: Buffer, offset: number): Date {
  const [yy, mo, dd, hh, mi, ss] = Array.from(buf.slice(offset, offset + 6));
  return new Date(Date.UTC(2000 + yy, mo - 1, dd, hh, mi, ss));
}

// BCD decode: mỗi nibble là một chữ số hex, 'f' là padding
function decodeBCD(buf: Buffer): string {
  return Array.from(buf)
    .flatMap((b) => [((b >> 4) & 0x0f).toString(16), (b & 0x0f).toString(16)])
    .join('')
    .replace(/f/gi, '');
}
