import { GPS_QUEUE } from '@app/third-party';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { SessionModule } from '../session/session.module';
import { TcpIngestionService } from './tcp-ingestion.service';

@Module({
  imports: [
    SessionModule,
    BullModule.registerQueue({
      name: GPS_QUEUE,
      defaultJobOptions: { removeOnComplete: true, removeOnFail: 10 },
    }),
  ],
  providers: [TcpIngestionService],
})
export class TcpIngestionModule {}
