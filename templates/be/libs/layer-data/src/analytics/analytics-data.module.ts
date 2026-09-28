import { Module } from '@nestjs/common';
import { INGESTION_REPOSITORY } from './analytics.repository';
import { PrismaIngestionRepository } from './prisma-ingestion.repository';

@Module({
  providers: [
    PrismaIngestionRepository,
    {
      provide: INGESTION_REPOSITORY,
      useExisting: PrismaIngestionRepository,
    },
  ],
  exports: [INGESTION_REPOSITORY],
})
export class AnalyticsDataModule {}
