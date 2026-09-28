import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeviceType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumberString, IsOptional, IsString, Length } from 'class-validator';

export class CreateDeviceDto {
  @ApiProperty({ example: '359587089876543' })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @Length(15, 15)
  @IsNumberString()
  imei: string;

  @ApiProperty({ example: 'Cooler 01' })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiPropertyOptional({ example: 'ASSET-001' })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @Length(1, 100)
  internalId?: string;

  @ApiProperty({ enum: DeviceType, example: DeviceType.COOLER })
  @IsEnum(DeviceType)
  type!: DeviceType;

  @ApiPropertyOptional({ example: 'uploads/devices/avatar-abc123.png' })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  avatar?: string;
}
