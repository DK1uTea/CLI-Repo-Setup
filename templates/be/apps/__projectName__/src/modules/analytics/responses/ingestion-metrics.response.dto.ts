import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class DeviceConnectivitySummaryDto {
  @ApiProperty({ example: 50 })
  @Expose()
  totalCount: number;

  @ApiProperty({ example: 12 })
  @Expose()
  onlineCount: number;

  @ApiProperty({ example: 35 })
  @Expose()
  offlineCount: number;

  @ApiProperty({ example: 3 })
  @Expose()
  neverSeenCount: number;

  @ApiPropertyOptional({ example: '2026-03-26T09:59:55.000Z' })
  @Expose()
  mostRecentConnection: Date | null;
}

@Exclude()
export class DeviceLastSeenDto {
  @ApiProperty({ example: 'clxyz123' })
  @Expose()
  deviceId: string;

  @ApiProperty({ example: '359587089876543' })
  @Expose()
  imei: string;

  @ApiProperty({ example: 'Xe tai Hino 01' })
  @Expose()
  name: string;

  @ApiPropertyOptional({ example: '2026-03-26T09:59:55.000Z' })
  @Expose()
  lastSeenAt: Date | null;

  @ApiProperty({ example: true })
  @Expose()
  isOnline: boolean;
}

@Exclude()
export class IngestionRateDto {
  @ApiProperty({ example: 8 })
  @Expose()
  positionsLast1Min: number;

  @ApiProperty({ example: 35 })
  @Expose()
  positionsLast5Min: number;

  @ApiProperty({ example: 420 })
  @Expose()
  positionsLast1Hour: number;

  @ApiProperty({ example: 7.0, description: 'Positions per minute (avg over last 5 min)' })
  @Expose()
  positionsPerMinute: number;
}

@Exclude()
export class ErrorSummaryDto {
  @ApiProperty({ example: 'DEVICE_OFFLINE' })
  @Expose()
  type: string;

  @ApiProperty({ example: 5 })
  @Expose()
  count: number;

  @ApiProperty({ example: '2026-03-26T09:58:00.000Z' })
  @Expose()
  latestAt: Date;
}

@Exclude()
export class IngestionMetricsResponseDto {
  @ApiProperty({ example: '2026-03-26T10:00:00.000Z' })
  @Expose()
  generatedAt: Date;

  @ApiProperty({ type: () => DeviceConnectivitySummaryDto })
  @Expose()
  @Type(() => DeviceConnectivitySummaryDto)
  deviceConnectivity: DeviceConnectivitySummaryDto;

  @ApiProperty({ type: () => DeviceLastSeenDto, isArray: true })
  @Expose()
  @Type(() => DeviceLastSeenDto)
  devices: DeviceLastSeenDto[];

  @ApiProperty({ type: () => IngestionRateDto })
  @Expose()
  @Type(() => IngestionRateDto)
  ingestionRate: IngestionRateDto;

  @ApiProperty({ type: () => ErrorSummaryDto, isArray: true })
  @Expose()
  @Type(() => ErrorSummaryDto)
  recentErrors: ErrorSummaryDto[];
}
