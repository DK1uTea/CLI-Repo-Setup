import { Module } from '@nestjs/common';
import { EVENTS_REPOSITORY } from './events.repository';
import { PrismaEventsRepository } from './prisma-events.repository';

@Module({
  providers: [
    PrismaEventsRepository,
    {
      provide: EVENTS_REPOSITORY,
      useExisting: PrismaEventsRepository,
    },
  ],
  exports: [EVENTS_REPOSITORY],
})
export class EventsDataModule {}
