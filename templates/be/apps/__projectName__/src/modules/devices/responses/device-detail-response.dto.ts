import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeviceType } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
class DeviceLocationDto {
  @ApiPropertyOptional({ example: '123 Nguyen Hue, District 1, Ho Chi Minh City', nullable: true })
  @Expose()
  address!: string | null;

  @ApiProperty({ example: 10.762622 })
  @Expose()
  latitude!: number;

  @ApiProperty({ example: 106.660172 })
  @Expose()
  longitude!: number;
}

@Exclude()
export class DeviceDetailResponseDto {
  @ApiProperty({ example: 'cmab8d9hh0000zsi0w8kc24q9' })
  @Expose()
  id!: string;

  @ApiProperty({ example: '359587089876543' })
  @Expose()
  imei!: string;

  @ApiProperty({ example: 'Cooler 01' })
  @Expose()
  name!: string;

  @ApiPropertyOptional({ example: 'ASSET-001', nullable: true })
  @Expose()
  internalId!: string | null;

  @ApiProperty({ enum: DeviceType, example: DeviceType.COOLER })
  @Expose()
  type!: DeviceType;

  @ApiPropertyOptional({
    example: 'https://bucket.s3.ap-southeast-1.amazonaws.com/uploads/devices/avatar-abc123.png',
    nullable: true,
  })
  @Expose()
  avatar!: string | null;

  @ApiProperty({ example: true })
  @Expose()
  isOnline!: boolean;

  @ApiPropertyOptional({ example: 85, nullable: true, description: 'Battery percentage (0–100)' })
  @Expose()
  battery!: number | null;

  @ApiPropertyOptional({ example: 4, nullable: true, description: 'GSM signal level' })
  @Expose()
  gsmSignal!: number | null;

  @ApiPropertyOptional({ example: '2026-03-18T08:30:00.000Z', nullable: true })
  @Expose()
  lastSeenAt!: Date | null;

  @ApiPropertyOptional({ type: () => DeviceLocationDto, nullable: true })
  @Expose()
  @Type(() => DeviceLocationDto)
  location!: DeviceLocationDto | null;

  @ApiProperty({ example: '2026-03-18T08:30:00.000Z' })
  @Expose()
  createdAt!: Date;

  @ApiProperty({ example: '2026-03-18T08:35:00.000Z' })
  @Expose()
  updatedAt!: Date;
}
