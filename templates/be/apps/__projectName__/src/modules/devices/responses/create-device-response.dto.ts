import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeviceType } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CreateDeviceResponseDto {
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

  @ApiProperty({ example: '2026-03-18T08:30:00.000Z' })
  @Expose()
  createdAt!: Date;
}
