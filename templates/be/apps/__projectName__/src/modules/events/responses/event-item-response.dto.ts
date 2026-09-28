import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class EventItemResponseDto {
  @ApiProperty({ example: '1234567890' })
  @Expose()
  id: BigInt;

  @ApiPropertyOptional({ example: '2026-03-18T08:30:00.000Z' })
  @Expose()
  deviceTime: Date;

  @ApiProperty({ enum: EventType, example: EventType.LOW_BATTERY })
  @Expose()
  type: EventType;

  @ApiPropertyOptional({ example: 'Battery level is below 20%' })
  @Expose()
  message: string | null;

  @ApiPropertyOptional({ example: { batteryLevel: 15 } })
  @Expose()
  payload: unknown;
}
