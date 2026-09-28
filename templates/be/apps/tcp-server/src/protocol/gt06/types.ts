import { DeviceProtocol } from '@prisma/client';

export type PktType = 'login' | 'location' | 'heartbeat' | 'alarm' | 'unknown';

interface BasePkt {
  proto: typeof DeviceProtocol.GT06;
  type: PktType;
  serial: number;
  raw: Buffer;
}

export interface LoginPkt extends BasePkt {
  type: 'login';
  imei: string;
}

export interface LocationPkt extends BasePkt {
  type: 'location';
  ts: Date;
  lat: number;
  lon: number;
  speed: number;
  course: number;
  sats: number;
  gpsOk: boolean;
}

export interface HeartbeatPkt extends BasePkt {
  type: 'heartbeat';
}

export interface AlarmPkt extends BasePkt {
  type: 'alarm';
  ts: Date;
}

export interface UnknownPkt extends BasePkt {
  type: 'unknown';
  protocol: number;
}

export type GT06Packet = LoginPkt | LocationPkt | HeartbeatPkt | AlarmPkt | UnknownPkt;
