import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { LatestPositionResponseDto } from './latest-position-response.dto';

/**
 * Lightweight live map position response optimized for map marker rendering.
 * Designed for low latency and minimal payload size.
 */

@Exclude()
export class LiveMapPositionsResponseDto {
  @ApiProperty({
    description: 'List of device positions for live map rendering',
    type: [LatestPositionResponseDto],
  })
  @Expose()
  @Type(() => LatestPositionResponseDto)
  items!: LatestPositionResponseDto[];

  @ApiProperty({
    description: 'Total number of devices returned',
    example: 50,
  })
  @Expose()
  total!: number;
}
