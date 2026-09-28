import { PagingDto, TenantDto } from '@app/core';
import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { DeviceType } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class ListDevicesDto extends IntersectionType(PagingDto, TenantDto) {
  @ApiPropertyOptional({ enum: DeviceType, example: DeviceType.COOLER })
  @IsOptional()
  @IsEnum(DeviceType)
  type?: DeviceType;
}
