import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class PositionDeviceDto {
  @ApiProperty({ example: 'cmo22131231231' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'internal-123' })
  @Expose()
  internalId!: string;

  @ApiProperty({ example: 'Xe tai Hino 01' })
  @Expose()
  name!: string;

  @ApiProperty({ example: '359587089876543' })
  @Expose()
  imei!: string;
}

@Exclude()
export class PositionStateDto {
  @ApiPropertyOptional({ example: 85 })
  @Expose()
  battery!: number | null;

  @ApiPropertyOptional({ example: 4.15 })
  @Expose()
  batteryVoltage!: number | null;

  @ApiPropertyOptional({ example: 23 })
  @Expose()
  gsmSignal!: number | null;

  @ApiPropertyOptional({ example: '2026-03-20T08:35:00.000Z' })
  @Expose()
  lastSeenAt!: Date | null;

  @ApiProperty({ example: true })
  @Expose()
  isOnline!: boolean;
}

@Exclude()
export class PositionDataDto {
  @ApiPropertyOptional({ example: '2026-03-20T08:35:00.000Z' })
  @Expose()
  deviceTime!: Date | null;

  @ApiPropertyOptional({ example: '123 Nguyen Hue, District 1, Ho Chi Minh City', nullable: true })
  @Expose()
  address!: string | null;

  @ApiPropertyOptional({ example: 10.7769 })
  @Expose()
  latitude!: number | null;

  @ApiPropertyOptional({ example: 106.7009 })
  @Expose()
  longitude!: number | null;

  @ApiPropertyOptional({ example: 60.5 })
  @Expose()
  speedKph!: number | null;

  @ApiPropertyOptional({ example: 180 })
  @Expose()
  heading!: number | null;

  @ApiPropertyOptional({ example: true })
  @Expose()
  gpsValid!: boolean | null;
}

@Exclude()
export class LatestPositionResponseDto {
  @ApiProperty({ type: () => PositionDeviceDto })
  @Expose()
  @Type(() => PositionDeviceDto)
  device!: PositionDeviceDto;

  @ApiProperty({ type: () => PositionStateDto })
  @Expose()
  @Type(() => PositionStateDto)
  state!: PositionStateDto;

  @ApiProperty({ type: () => PositionDataDto })
  @Expose()
  @Type(() => PositionDataDto)
  position!: PositionDataDto;
}
