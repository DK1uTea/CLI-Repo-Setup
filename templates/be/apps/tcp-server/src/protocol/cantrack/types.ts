import { DeviceProtocol } from '@prisma/client';

export type CANType = 'gps' | 'lbs' | 'heartbeat' | 'ack' | 'unknown';

// equ_status: 4 bytes hex (8 ASCII chars), negative logic — bit=0 nghĩa là alarm đang kích hoạt
export interface EquStatus {
  raw: string;
  removal: boolean; // byte 1, bit 2: cảnh báo tháo thiết bị
  vibration: boolean; // byte 3, bit 3: cảnh báo rung
  lowBattery: boolean; // byte 3, bit 4: pin yếu
  overspeed: boolean; // byte 4, bit 2: vượt tốc độ
  fenceIn: boolean; // byte 4, bit 4: vào vùng địa lý
  fenceOut: boolean; // byte 4, bit 7: ra khỏi vùng địa lý
}

export interface CANPacket {
  proto: typeof DeviceProtocol.CANTRACK;
  type: CANType;
  imei?: string;
  ts?: Date;
  lat?: number;
  lon?: number;
  speed?: number;
  course?: number;
  gpsOk?: boolean;
  battery?: number; // phần trăm pin (0–100), từ HTBT
  equStatus?: EquStatus; // trạng thái thiết bị + alarm, từ V1/V3/V4
  raw: string;
}
