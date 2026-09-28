import { DevicesDataModule, PositionsDataModule, SettingsDataModule } from '@app/layer-data';
import { CacheModule, GPS_QUEUE } from '@app/third-party';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { GeocodingModule } from '../geocoding';
import { GpsProcessor } from './processors';

@Module({
  imports: [
    DevicesDataModule,
    PositionsDataModule,
    SettingsDataModule,
    CacheModule,
    BullModule.registerQueue({ name: GPS_QUEUE }),
    GeocodingModule,
  ],
  providers: [GpsProcessor],
})
export class GPSModule {}
