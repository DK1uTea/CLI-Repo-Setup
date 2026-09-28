import { ApiPropertyOptional } from '@nestjs/swagger';
import { DeviceType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class UpdateDeviceDto {
  @ApiPropertyOptional({ example: 'Cooler 01' })
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @ApiPropertyOptional({ example: 'ASSET-001' })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @Length(1, 100)
  internalId?: string;

  @ApiPropertyOptional({ enum: DeviceType, example: DeviceType.COOLER })
  @IsOptional()
  @IsEnum(DeviceType)
  type?: DeviceType;

  @ApiPropertyOptional({ example: 'uploads/devices/avatar-abc123.png' })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  avatar?: string;
}
