import { Module } from '@nestjs/common';
import NodeGeocoder from 'node-geocoder';

import { GEOCODER } from './geocoding.constants';
import { GeocodingService } from './geocoding.service';

@Module({
  providers: [
    {
      provide: GEOCODER,
      useFactory: () => NodeGeocoder({ provider: 'openstreetmap' }),
    },
    GeocodingService,
  ],
  exports: [GeocodingService],
})
export class GeocodingModule {}
