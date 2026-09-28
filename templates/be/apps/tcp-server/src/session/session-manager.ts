import type net from 'node:net';
import { Logger } from '@nestjs/common';
import { DeviceProtocol } from '@prisma/client';
import { htbtAck, iccidAck } from '../protocol/cantrack/builder';
import { parseCAN } from '../protocol/cantrack/parser';
import type { CANPacket } from '../protocol/cantrack/types';
import { heartbeatAck, loginAck } from '../protocol/gt06/builder';
import { parseGT06 } from '../protocol/gt06/parser';
import type { GT06Packet } from '../protocol/gt06/types';
import type { SessionRegistry } from './session-registry';

export type RawEvent =
  | { src: typeof DeviceProtocol.GT06; pkt: GT06Packet }
  | { src: typeof DeviceProtocol.CANTRACK; pkt: CANPacket };

export interface SessionOpts {
  socket: net.Socket;
  registry: SessionRegistry;
  onEvent: (imei: string, evt: RawEvent) => Promise<void>;
  timeoutMs?: number;
}

// Plain class — instantiated per TCP connection, not a NestJS provider.
// SessionRegistry is passed via opts so TcpIngestionService can inject and forward it.
export class Session {
  private readonly logger = new Logger(Session.name);
  private imei: string | null = null;
  private buf: Buffer = Buffer.alloc(0);

  constructor(private readonly opts: SessionOpts) {
    const { socket, registry, timeoutMs = 5 * 60_000 } = opts;

    socket.setTimeout(timeoutMs);
    socket.on('data', (chunk: Buffer | string) => {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      this.feed(buf);
    });
    socket.on('timeout', () => {
      this.logger.warn(`Session timeout [imei=${this.imei}]`);
      socket.destroy();
    });
    socket.on('close', () => {
      this.logger.log(`Session closed [imei=${this.imei}]`);
      if (this.imei) registry.unregister(this.imei);
    });
    socket.on('error', (e) => this.logger.error(`Session error [imei=${this.imei}]: ${e.message}`));
  }

  private feed(chunk: Buffer): void {
    this.buf = Buffer.concat([this.buf, chunk]);
    this.drain();
  }

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: binary protocol framing requires multiple branches
  private drain(): void {
    while (this.buf.length > 0) {
      // GT06 binary: starts with 0x78 0x78
      if (this.buf[0] === 0x78 && this.buf[1] === 0x78) {
        if (this.buf.length < 3) break;
        const pktLen = this.buf[2] + 5;
        if (this.buf.length < pktLen) break;

        this.handleGT06(Buffer.from(this.buf.subarray(0, pktLen)));
        this.buf = Buffer.from(this.buf.subarray(pktLen));
        continue;
      }

      // CANTRACK ASCII: starts with 0x2a ('*'), ends with 0x23 ('#')
      if (this.buf[0] === 0x2a) {
        const end = this.buf.indexOf(0x23);
        if (end === -1) break;
        this.handleCAN(Buffer.from(this.buf.subarray(0, end + 1)).toString('ascii'));
        this.buf = Buffer.from(this.buf.subarray(end + 1));
        continue;
      }

      // Unknown byte — log context to understand what the device is sending
      this.logger.warn(
        `Skipping unknown byte 0x${this.buf[0].toString(16)} [imei=${this.imei}] context=${this.buf.subarray(0, Math.min(32, this.buf.length)).toString('hex')}`,
      );
      this.buf = Buffer.from(this.buf.subarray(1));
    }

    if (this.buf.length > 4096) {
      this.logger.error(`Buffer overflow, resetting [imei=${this.imei}]`);
      this.buf = Buffer.alloc(0);
    }
  }

  private handleGT06(raw: Buffer): void {
    const pkt = parseGT06(raw);

    if (pkt?.type !== 'location') {
      this.logger.warn(
        `Non-GPS CAN packet [imei=${this.imei}] type=${pkt?.type} raw=${raw.toString('hex')}`,
      );
    }

    this.logger.warn(
      `GT06 frame parse [imei=${this.imei}] raw=${raw.toString('hex')} pkt=${JSON.stringify(pkt || {})}`,
    );
    if (!pkt) {
      return;
    }

    if (pkt.type === 'login') {
      this.imei = pkt.imei;
      this.logger.log(`GT06 login [imei=${this.imei}]`);
      this.opts.socket.write(loginAck(pkt.serial));
      this.opts.registry.register(this.imei);
    }

    if (pkt.type === 'heartbeat') {
      this.opts.socket.write(heartbeatAck(pkt.serial));
      if (this.imei) this.opts.registry.update(this.imei);
    }

    if (pkt.type === 'location' && this.imei) {
      this.opts.registry.update(this.imei);
      this.logger.log(
        `GT06 location [imei=${this.imei}] lat=${pkt.lat} lon=${pkt.lon} speed=${pkt.speed}`,
      );
    }

    if (this.imei) {
      this.opts
        .onEvent(this.imei, { src: DeviceProtocol.GT06, pkt })
        .catch((e: Error) => this.logger.error(`onEvent error: ${e.message}`));
    }
  }

  private handleCAN(line: string): void {
    const pkt = parseCAN(line);

    if (pkt?.type !== 'gps') {
      this.logger.warn(`Non-GPS CAN packet [imei=${this.imei}] type=${pkt?.type} raw=${line}`);
    }

    this.logger.debug(
      `CAN frame parse [imei=${this.imei}] raw=${line} pkt=${JSON.stringify(pkt || {})}`,
    );
    if (!pkt) {
      return;
    }
    const imei = pkt.imei ?? this.imei;
    if (!imei) return;

    this.imei = imei;

    // ACK bắt buộc theo spec — thiếu thì thiết bị retry liên tục
    if (pkt.type === 'heartbeat' && pkt.imei) {
      this.opts.socket.write(htbtAck(pkt.imei, pkt.battery));
    } else if (pkt.type === 'ack' && pkt.imei) {
      this.opts.socket.write(iccidAck(pkt.imei));
    }

    this.opts
      .onEvent(imei, { src: DeviceProtocol.CANTRACK, pkt })
      .catch((e: Error) => this.logger.error(`onEvent error: ${e.message}`));
  }
}
