import { createPaginationResponseDto } from '@app/core';
import { LatestPositionResponseDto } from './latest-position-response.dto';

export class LatestPositionsResponseDto extends createPaginationResponseDto(
  LatestPositionResponseDto,
) {}
