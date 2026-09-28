import { Module } from '@nestjs/common';
import { DEVICES_REPOSITORY } from './devices.repository';
import { PrismaDevicesRepository } from './prisma-devices.repository';

/**
 * DevicesDataModule — cung cấp data access cho domain Devices.
 *
 * Import module này vào feature module cần đọc/ghi device data.
 * Chỉ export DI token — consumer không biết về class cụ thể.
 *
 * PrismaService được inject tự động qua PrismaModule (global).
 */
@Module({
  providers: [
    PrismaDevicesRepository,
    {
      provide: DEVICES_REPOSITORY,
      useExisting: PrismaDevicesRepository,
    },
  ],
  exports: [DEVICES_REPOSITORY],
})
export class DevicesDataModule {}
