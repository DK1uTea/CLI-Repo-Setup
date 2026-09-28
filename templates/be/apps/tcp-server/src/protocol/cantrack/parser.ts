// Parses *HQ CANTRACK ASCII frames:
//   *HQ,<IMEI>,<CMD>,[fields...]#
//
// Commands theo spec 2025 CANTRACK PROTOCOL:
//   HTBT  — heartbeat         *HQ,IMEI,HTBT,battery%,remain_pings#
//   ICCID — SIM card query    *HQ,IMEI,ICCID,<iccid>#
//   V1    — GPS location      *HQ,IMEI,V1,HHMMSS,A/V/B,lat,N/S,lon,E/W,speed,course,DDMMYY,equ_status#
//   V3    — LBS (cell tower)  *HQ,IMEI,V3,HHMMSS,MCC,MNC,Base_Num,LAC,CellID,...,Battery,Failure,X,DDMMYY,equ_status#
//   V4    — Confirm+GPS       *HQ,IMEI,V4,CMD,hhmmss,HHMMSS,A/V/B,lat,N/S,lon,E/W,speed,course,DDMMYY,equ_status#
//   V5    — WiFi positioning  *HQ,IMEI,V5,HHMMSS,count,bssid1,...,Battery,DDMMYY,equ_status#

import { DeviceProtocol } from '@prisma/client';
import type { CANPacket, EquStatus } from './types';

export function parseCAN(line: string): CANPacket | null {
  const raw = line.trim();

  // Must start with '*' and end with '#'
  if (!raw.startsWith('*') || !raw.endsWith('#')) return null;

  // Strip delimiters and split
  const parts = raw.slice(1, -1).split(',');
  if (parts.length < 4) return null;

  // Format: *<brand>,<imei>,<command>,[fields...]#
  const [, imei, command, ...rest] = parts;
  if (!imei || !command) return null;

  const base: CANPacket = { proto: DeviceProtocol.CANTRACK, type: 'unknown', raw };

  switch (command) {
    case 'HTBT': {
      // rest: [battery%, remain_pings]
      const batteryRaw = parseInt(rest[0], 10);
      const battery = Number.isNaN(batteryRaw) ? undefined : batteryRaw;
      return { ...base, imei, type: 'heartbeat', battery };
    }

    case 'ICCID':
      return { ...base, imei, type: 'ack' };

    case 'V1':
      // rest: HHMMSS, A/V/B, lat, N/S, lon, E/W, speed_knots, course, DDMMYY, equ_status
      return parseGpsFields(rest, { ...base, imei });

    case 'V4':
      // rest: CMD, hhmmss_original, HHMMSS, A/V/B, lat, N/S, lon, E/W, speed, course, DDMMYY, equ_status
      // GPS fields bắt đầu từ index 2 (bỏ qua CMD và hhmmss_original)
      return parseGpsFields(rest.slice(2), { ...base, imei });

    case 'V3': {
      // LBS packet — số lượng cell thay đổi → length không cố định
      if (rest.length < 5) return { ...base, imei, type: 'lbs' };
      const time = rest[0];
      const equRaw = rest[rest.length - 1];
      const date = rest[rest.length - 2]; // DDMMYY luôn là penultimate
      const ts = parseHQTimestamp(time, date);
      const equStatus = parseEquStatus(equRaw);
      return { ...base, imei, type: 'lbs', ts, equStatus };
    }

    case 'V5':
      // WiFi positioning — không có tọa độ GPS trực tiếp
      return { ...base, imei, type: 'heartbeat' };

    default:
      return { ...base, imei };
  }
}

// ── GPS fields parser (dùng chung cho V1 và V4) ──────────────────────────────

function parseGpsFields(rest: string[], base: CANPacket): CANPacket {
  if (rest.length < 9) return base;
  const [time, validity, latRaw, latDir, lonRaw, lonDir, speedKnots, courseRaw, date, equRaw] =
    rest;

  const lat = nmeaToDecimal(latRaw, latDir);
  const lon = nmeaToDecimal(lonRaw, lonDir);
  const speed = parseFloat(speedKnots) * 1.852; // knots → km/h
  const ts = parseHQTimestamp(time, date);
  // A = GPS valid, B = Beidou valid (cả hai đều là tọa độ hợp lệ), V = invalid
  const gpsOk = validity === 'A' || validity === 'B';
  const equStatus = parseEquStatus(equRaw);

  return {
    ...base,
    type: 'gps',
    ts,
    lat,
    lon,
    speed,
    course: parseFloat(courseRaw),
    gpsOk,
    equStatus,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseEquStatus(raw: string | undefined): EquStatus | undefined {
  if (!raw || raw.length < 8) return undefined;
  const b0 = parseInt(raw.slice(0, 2), 16);
  const b2 = parseInt(raw.slice(4, 6), 16);
  const b3 = parseInt(raw.slice(6, 8), 16);
  if (Number.isNaN(b0) || Number.isNaN(b2) || Number.isNaN(b3)) return undefined;
  return {
    raw,
    removal: !(b0 & 0x04),
    vibration: !(b2 & 0x08),
    lowBattery: !(b2 & 0x10),
    overspeed: !(b3 & 0x04),
    fenceIn: !(b3 & 0x10),
    fenceOut: !(b3 & 0x80),
  };
}

/** NMEA ddmm.mmmmm + N/S/E/W → decimal degrees */
function nmeaToDecimal(nmea: string, dir: string): number {
  const raw = parseFloat(nmea);
  if (Number.isNaN(raw)) return 0;
  const deg = Math.floor(raw / 100);
  const decimal = deg + (raw - deg * 100) / 60;
  return dir === 'S' || dir === 'W' ? -decimal : decimal;
}

/** Parse HHMMSS + DDMMYY → UTC Date */
function parseHQTimestamp(time: string, date: string): Date {
  if (!time || !date || time.length < 6 || date.length < 6) return new Date();
  const hh = parseInt(time.slice(0, 2), 10);
  const mm = parseInt(time.slice(2, 4), 10);
  const ss = parseInt(time.slice(4, 6), 10);
  const dd = parseInt(date.slice(0, 2), 10);
  const mo = parseInt(date.slice(2, 4), 10) - 1;
  const yy = 2000 + parseInt(date.slice(4, 6), 10);
  return new Date(Date.UTC(yy, mo, dd, hh, mm, ss));
}
