import { SettingsDataModule, UsersDataModule } from '@app/layer-data';
import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [SettingsDataModule, UsersDataModule],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
