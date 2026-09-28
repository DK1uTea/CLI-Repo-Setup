// Flat string-only payload cho BullMQ job.

import { DeviceProtocol } from '@prisma/client';

// Mọi field đều là string để đồng nhất — consumer tự parse lại khi cần.
export interface GpsJobData {
  imei: string;
  src: DeviceProtocol;
  type: string; // 'location' | 'gps' | 'heartbeat' | 'lbs' | 'ack' | 'alarm' | 'unknown'
  ts: string; // ISO string — device time nếu có, fallback là server time
  // GPS fields — chỉ có khi type === 'location' | 'gps'
  lat?: string;
  lon?: string;
  speed?: string;
  course?: string;
  sats?: string;
  gpsOk?: string;
  // CANTRACK-specific
  battery?: string;
  equStatus?: string; // JSON.stringify(EquStatus)
  // Raw payload để debug
  raw: string; // hex string (GT06) hoặc ASCII string (CANTRACK)
}
