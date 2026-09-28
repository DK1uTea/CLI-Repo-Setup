import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetDeviceEventsParamDto {
  @ApiProperty({
    description: 'Device ID',
    example: 'cmab8d9hh0000zsi0w8kc24q9',
  })
  @IsString()
  deviceId!: string;
}
