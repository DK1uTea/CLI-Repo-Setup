import { GpsJobData } from '@app/third-party';
import { DeviceProtocol } from '@prisma/client';
import type { RawEvent } from '../session/session-manager';

// Chuyển RawEvent từ Session thành GpsJobData để đưa vào BullMQ queue.
// Mirror logic của eventToFields() trong protrack-tcp-server/src/ingestion/tcp-server.ts.
export function eventToJobData(imei: string, evt: RawEvent): GpsJobData {
  const serverTs = new Date().toISOString();

  if (evt.src === DeviceProtocol.GT06) {
    const { pkt } = evt;
    const base: GpsJobData = {
      imei,
      src: DeviceProtocol.GT06,
      type: pkt.type,
      ts: serverTs,
      raw: pkt.raw.toString('hex'),
    };

    if (pkt.type === 'location') {
      return {
        ...base,
        ts: pkt.ts.toISOString(),
        lat: String(pkt.lat),
        lon: String(pkt.lon),
        speed: String(pkt.speed),
        course: String(pkt.course),
        sats: String(pkt.sats),
        gpsOk: String(pkt.gpsOk),
      };
    }

    return base;
  }

  // CANTRACK
  const { pkt } = evt;
  return {
    imei,
    src: DeviceProtocol.CANTRACK,
    type: pkt.type,
    ts: pkt.ts?.toISOString() ?? serverTs,
    lat: pkt.lat !== undefined ? String(pkt.lat) : undefined,
    lon: pkt.lon !== undefined ? String(pkt.lon) : undefined,
    speed: pkt.speed !== undefined ? String(pkt.speed) : undefined,
    course: pkt.course !== undefined ? String(pkt.course) : undefined,
    gpsOk: pkt.gpsOk !== undefined ? String(pkt.gpsOk) : undefined,
    battery: pkt.battery !== undefined ? String(pkt.battery) : undefined,
    equStatus: pkt.equStatus ? JSON.stringify(pkt.equStatus) : undefined,
    raw: pkt.raw,
  };
}
