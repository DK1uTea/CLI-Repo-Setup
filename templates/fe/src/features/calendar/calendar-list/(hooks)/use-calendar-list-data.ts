"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";
import { REPEATED_ARRAY_PARAMS_SERIALIZER } from "@/lib/query-params";
import type { PaginationType } from "@/shared/types/pagination-type";

export type CalendarEventStatus = "ACTIVE" | "DRAFT" | "DELETED";

export type CalendarEventItem = {
  id: string;
  title: string;
  type?: string;
  status?: CalendarEventStatus;
  startDate: string;
  endDate: string;
  adminContact?: { name?: string; email?: string };
  isOwner?: boolean;
};

// The backend now groups events by month itself (`month` is "YYYY-MM") —
// the FE no longer derives this grouping from a flat event list.
export type CalendarEventGroup = {
  month: string;
  total: number;
  events: CalendarEventItem[];
};

type CalendarListEnvelope = {
  data?: {
    items?: CalendarEventGroup[];
    pagination?: PaginationType;
  };
};

export type CalendarListParams = {
  search?: string;
  sort?: string;
  filter?: string;
  status?: string | null;
  eventTypeId?: string | null;
  timeFrame?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  partnershipTypes?: string[] | null;
  productPartnerCategories?: string[] | null;
  targetAudience?: string[] | null;
  onlyMine?: boolean | null;
  userId?: string | null;
  limit?: number;
};

// Page boundaries can split a month's events across two pages, each arriving
// as its own group for that month — merge those before rendering so a month
// never renders as two separate sections.
export function mergeCalendarEventGroups(
  groups: CalendarEventGroup[],
): CalendarEventGroup[] {
  const merged: Record<string, CalendarEventGroup> = {};
  for (const group of groups) {
    const events = Array.isArray(group?.events) ? group.events : [];
    if (!merged[group.month]) {
      merged[group.month] = { month: group.month, total: 0, events: [] };
    }
    merged[group.month].events.push(...events);
    merged[group.month].total = merged[group.month].events.length;
  }
  return Object.values(merged);
}

export async function fetchCalendarEvents(
  params: CalendarListParams,
  page: number,
): Promise<{ groups: CalendarEventGroup[]; pagination?: PaginationType }> {
  const response = await apiProxy.get<CalendarListEnvelope>("etr/calendar", {
    params: {
      page,
      limit: params.limit ?? 10,
      search: params.search || undefined,
      sort: params.sort || undefined,
      filter: params.filter || undefined,
      status: params.status || undefined,
      eventTypeId: params.eventTypeId || undefined,
      timeFrame: params.timeFrame && params.timeFrame !== 'all'
        ? params.timeFrame
        : undefined,
      startDate: params.startDate || undefined,
      endDate: params.endDate || undefined,
      partnershipTypes: params.partnershipTypes?.length
        ? params.partnershipTypes
        : undefined,
      productPartnerCategories: params.productPartnerCategories?.length
        ? params.productPartnerCategories
        : undefined,
      targetAudience: params.targetAudience?.length
        ? params.targetAudience
        : undefined,
      onlyMine: params.onlyMine || undefined,
      createdBy: params.userId && params.userId !== 'all' ? params.userId : undefined,
    },
    paramsSerializer: REPEATED_ARRAY_PARAMS_SERIALIZER,
  });

  const data = response.data?.data;
  return {
    groups: Array.isArray(data?.items) ? data.items : [],
    pagination: data?.pagination,
  };
}

export function useCalendarListData(
  params: CalendarListParams,
  options: { enabled?: boolean } | boolean = true,
) {
  const enabled = typeof options === 'boolean' ? options : options.enabled ?? true

  return useInfiniteQuery({
    queryKey: ["calendar-list", params],
    enabled,
    queryFn: ({ pageParam }) => fetchCalendarEvents(params, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
    initialPageParam: 1,
  });
}
