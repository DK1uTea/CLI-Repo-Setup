import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UpsertUnknownDevicePolicyResponseDto {
  @ApiProperty({ example: true })
  @Expose()
  value: unknown;

  @ApiProperty({ example: '2026-03-27T08:30:00.000Z' })
  @Expose()
  updatedAt: Date;
}
