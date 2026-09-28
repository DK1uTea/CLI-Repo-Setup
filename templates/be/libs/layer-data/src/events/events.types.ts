import type { KeywordPagingQuery, PaginatedResult } from '@app/core';
import type { EventType } from '@prisma/client';

export interface EventListItemEntity {
  id: BigInt;
  deviceTime: Date;
  type: EventType;
  message: string | null;
  payload: unknown;
}

export interface ListEventsQuery extends KeywordPagingQuery {
  /** undefined = all tenants (SUPER_ADMIN only); string[] = operator visibility set. */
  tenantId?: string | string[];
}

export interface ListEventsByDeviceQuery extends KeywordPagingQuery {
  /** undefined = all tenants (SUPER_ADMIN only); string[] = operator visibility set. */
  tenantId?: string | string[];
  deviceId: string;
}

export type ListEventsResult = PaginatedResult<EventListItemEntity>;
