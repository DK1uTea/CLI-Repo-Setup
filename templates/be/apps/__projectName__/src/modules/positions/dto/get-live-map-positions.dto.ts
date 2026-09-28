import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsOptional, IsString } from 'class-validator';

export class GetLiveMapPositionsDto {
  @ApiPropertyOptional({
    description:
      'Filter by specific device IDs. If not provided, returns all devices accessible to the user.',
    example: ['cmab8d9hh0000zsi0w8kc24q9', 'cmab8d9hh0001zsi0w8kc24q0'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(1000)
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  deviceIds?: string[];
}

export class GetDeviceLatestPositionParamDto {
  @ApiProperty({
    description: 'Device ID',
    example: 'cmab8d9hh0000zsi0w8kc24q9',
  })
  @IsString()
  id: string;
}
