// CRC16-CCITT — dùng chung cho cả parser và builder
export function crc16(buf: Buffer): number {
  let crc = 0xffff;
  for (const b of buf) {
    crc ^= b << 8;
    for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
  }
  return crc & 0xffff;
}

// Wrap content vào GT06 envelope
// LEN = content.length + 2 (tính cả 2 bytes CRC)
export function wrap(content: Buffer): Buffer {
  const len = content.length + 2;
  const pkt = Buffer.alloc(2 + 1 + content.length + 2 + 2);
  pkt[0] = 0x78;
  pkt[1] = 0x78;
  pkt[2] = len;
  content.copy(pkt, 3);
  pkt.writeUInt16BE(crc16(pkt.slice(2, 3 + content.length)), 3 + content.length);
  pkt[pkt.length - 2] = 0x0d;
  pkt[pkt.length - 1] = 0x0a;
  return pkt;
}

export function loginAck(serial: number): Buffer {
  const body = Buffer.alloc(3);
  body[0] = 0x01; // protocol: login response
  body.writeUInt16BE(serial, 1); // echo lại đúng serial từ chip
  return wrap(body);
}

export function heartbeatAck(serial: number): Buffer {
  const body = Buffer.alloc(3);
  body[0] = 0x13; // protocol: heartbeat response
  body.writeUInt16BE(serial, 1);
  return wrap(body);
}
