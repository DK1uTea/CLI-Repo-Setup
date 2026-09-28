'use client';

import { useQuery } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";
import { RecentActivity } from "../../(helpers)/recent-activity-type";
import { PaginationType } from "@/shared/types/pagination-type";
import { parseAsInteger, useQueryStates } from "nuqs";

type EventActivityResponse = {
  items: RecentActivity[];
  pagination: PaginationType;
}

type EventActivityFilters = {
  page?: number;
  limit?: number;
}

const fetchEventActivity = async (
  eventId: string,
  filters: EventActivityFilters
): Promise<EventActivityResponse> => {
  const response = await apiProxy.get('tf/dashboard/activities', {
    params: { eventId, ...filters },
  })
  return response.data.data as EventActivityResponse
}

export const useEventActivity = (eventId: string, defaultLimit = 10) => {
  const [filters, setFilters] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(defaultLimit),
  })

  const query = useQuery({
    queryKey: ['trade-fair-event-activity', eventId, filters],
    queryFn: () => fetchEventActivity(eventId, filters),
    enabled: !!eventId,
  })

  return {
    eventActivity: Array.isArray(query.data?.items) ? query.data.items : [],
    eventActivityPagination: query.data?.pagination,
    isLoading: query.isLoading,
    filters,
    setFilters,
  }
}
