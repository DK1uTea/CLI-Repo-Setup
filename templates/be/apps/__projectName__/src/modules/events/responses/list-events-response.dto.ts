import { createPaginationResponseDto } from '@app/core';
import { EventItemResponseDto } from './event-item-response.dto';

export class ListEventsResponseDto extends createPaginationResponseDto(EventItemResponseDto) {}
