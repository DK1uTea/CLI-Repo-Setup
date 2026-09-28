import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsISO8601, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListPositionHistoryDto {
  @ApiProperty({
    example: 'cmab8d9hh0000zsi0w8kc24q9',
    description: 'Device ID to fetch history for',
  })
  @IsString()
  deviceId!: string;

  @ApiProperty({
    example: '2026-03-20T00:00:00.000Z',
    description: 'Start of time range (inclusive)',
  })
  @IsISO8601()
  from!: string;

  @ApiProperty({
    example: '2026-03-20T23:59:59.000Z',
    description: 'End of time range (inclusive)',
  })
  @IsISO8601()
  to!: string;

  @ApiPropertyOptional({
    example: 10,
    description:
      'Number of records per page. Default is 10, max is 100. Each day capped at 5 records.',
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    example: 'eyJkYXRlIjoiMjAyNi0wMy0yMFQwODozNTowMCIsImlkIjo5OTV9',
    description:
      'Opaque cursor for pagination. Omit for first page, use nextCursor from previous response for subsequent pages.',
  })
  @IsString()
  @IsOptional()
  cursor?: string;
}
