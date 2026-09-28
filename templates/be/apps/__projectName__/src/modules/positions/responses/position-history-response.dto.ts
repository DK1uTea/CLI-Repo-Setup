import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class PositionStateSnapshotDto {
  @ApiPropertyOptional({ example: 85 })
  @Expose()
  battery!: number | null;

  @ApiPropertyOptional({ example: 4.15 })
  @Expose()
  batteryVoltage!: number | null;

  @ApiPropertyOptional({ example: 23 })
  @Expose()
  gsmSignal!: number | null;
}

@Exclude()
export class PositionHistoryItemResponseDto {
  @ApiProperty({ example: '2026-03-20T08:35:00.000Z' })
  @Expose()
  deviceTime!: Date;

  @ApiPropertyOptional({ example: '123 Nguyen Hue, District 1, Ho Chi Minh City', nullable: true })
  @Expose()
  address!: string | null;

  @ApiProperty({ example: 10.7769 })
  @Expose()
  latitude!: number;

  @ApiProperty({ example: 106.7009 })
  @Expose()
  longitude!: number;

  @ApiPropertyOptional({ example: 5.0 })
  @Expose()
  accuracy!: number | null;

  @ApiPropertyOptional({ example: 10.5 })
  @Expose()
  altitude!: number | null;

  @ApiPropertyOptional({ example: 60.5 })
  @Expose()
  speedKph!: number | null;

  @ApiPropertyOptional({ example: 180 })
  @Expose()
  heading!: number | null;

  @ApiPropertyOptional({ example: 8 })
  @Expose()
  satellites!: number | null;

  @ApiProperty({ example: true })
  @Expose()
  gpsValid!: boolean;

  @ApiPropertyOptional({ type: () => PositionStateSnapshotDto })
  @Expose()
  @Type(() => PositionStateSnapshotDto)
  state!: PositionStateSnapshotDto | null;
}

@Exclude()
export class PositionHistoryResponseDto {
  @ApiProperty({ type: [PositionHistoryItemResponseDto] })
  @Expose()
  @Type(() => PositionHistoryItemResponseDto)
  items!: PositionHistoryItemResponseDto[];

  @ApiPropertyOptional({
    example: 'eyJkYXRlIjoiMjAyNi0wMy0yMFQwODozNTowMCIsImlkIjo5OTV9',
    description: 'Cursor for fetching next page. Omit if hasMore is false.',
  })
  @Expose()
  @Type(() => String)
  nextCursor?: string | null;

  @ApiProperty({
    example: true,
    description: 'Whether there are more records to fetch using nextCursor.',
  })
  @Expose()
  @Type(() => Boolean)
  hasMore!: boolean;
}
