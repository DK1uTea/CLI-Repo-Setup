import { Module } from '@nestjs/common';
import { DEVICE_STATUS_REPOSITORY, POSITIONS_REPOSITORY } from './positions.repository';
import { PrismaDeviceStatusRepository } from './prisma-device-status.repository';
import { PrismaPositionsRepository } from './prisma-positions.repository';

@Module({
  providers: [
    PrismaPositionsRepository,
    {
      provide: POSITIONS_REPOSITORY,
      useExisting: PrismaPositionsRepository,
    },
    PrismaDeviceStatusRepository,
    {
      provide: DEVICE_STATUS_REPOSITORY,
      useExisting: PrismaDeviceStatusRepository,
    },
  ],
  exports: [POSITIONS_REPOSITORY, DEVICE_STATUS_REPOSITORY],
})
export class PositionsDataModule {}
