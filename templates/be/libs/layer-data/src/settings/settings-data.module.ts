import { Module } from '@nestjs/common';
import { PrismaSettingsRepository } from './prisma-settings.repository';
import { SETTINGS_REPOSITORY } from './settings.repository';

@Module({
  providers: [
    PrismaSettingsRepository,
    {
      provide: SETTINGS_REPOSITORY,
      useExisting: PrismaSettingsRepository,
    },
  ],
  exports: [SETTINGS_REPOSITORY],
})
export class SettingsDataModule {}
