import { Inject, Injectable, Logger } from '@nestjs/common';
import { type Geocoder } from 'node-geocoder';

import { GEOCODER } from './geocoding.constants';

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);

  constructor(
    @Inject(GEOCODER)
    private readonly geocoder: Geocoder,
  ) {}

  async reverse(lat: number, lon: number) {
    try {
      const res = await this.geocoder.reverse({ lat, lon });
      this.logger.debug(`Geocoding result: ${JSON.stringify(res)}`);
      return res[0] ?? null;
    } catch (error) {
      this.logger.error('Error occurred while reverse geocoding', error as Error);
      return null;
    }
  }
}
