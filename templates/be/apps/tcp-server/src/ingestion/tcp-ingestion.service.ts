import net from 'node:net';
import type { ITcpConfig } from '@app/core';
import { tcpConfiguration } from '@app/core';
import { GPS_QUEUE, GpsJobData } from '@app/third-party';
import { InjectQueue } from '@nestjs/bullmq';
import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import type { RawEvent } from '../session/session-manager';
import { Session } from '../session/session-manager';
import { SessionRegistry } from '../session/session-registry';
import { eventToJobData } from './gps.queue';

@Injectable()
export class TcpIngestionService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(TcpIngestionService.name);
  private readonly servers: net.Server[] = [];

  constructor(
    private readonly sessionRegistry: SessionRegistry,
    @InjectQueue(GPS_QUEUE) private readonly queue: Queue<GpsJobData>,
    @Inject(tcpConfiguration.KEY) private readonly config: ITcpConfig,
  ) {}

  onApplicationBootstrap(): void {
    this.startServer(this.config.tcpPort1);
    this.startServer(this.config.tcpPort2);
  }

  async onApplicationShutdown(): Promise<void> {
    await Promise.all(
      this.servers.map(
        (srv) =>
          new Promise<void>((resolve) => {
            srv.close(() => resolve());
          }),
      ),
    );
    this.logger.log('All TCP servers closed');
  }

  private startServer(port: number): void {
    const srv = net.createServer((socket) => {
      const remote = `${socket.remoteAddress}:${socket.remotePort}`;
      this.logger.log(`TCP client connected: ${remote}`);

      new Session({
        socket,
        registry: this.sessionRegistry,
        onEvent: (imei: string, evt: RawEvent) => this.publishJob(imei, evt),
      });
    });

    srv.on('error', (err) => this.logger.error(`TCP server error on port ${port}: ${err.message}`));
    srv.listen(port, '0.0.0.0', () => this.logger.log(`TCP server listening on port ${port}`));
    this.servers.push(srv);
  }

  private async publishJob(imei: string, evt: RawEvent): Promise<void> {
    const data = eventToJobData(imei, evt);
    await this.queue.add('gps-packet', data);
  }
}
