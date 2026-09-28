'use client'

import type { TradeFairEvent } from '../../(helpers)/trade-fair-event-type'
import type { PaginationType } from '@/shared/types/pagination-type'
import { apiProxy } from '@/lib/api'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { useInfiniteQuery } from '@tanstack/react-query'

type EventListResponse = {
  items: TradeFairEvent[],
  pagination: PaginationType,
}

const fetchEventsList = async (filters: {
  page?: number;
  limit?: number;
  search?: string;
  sortEventId?: string
}): Promise<EventListResponse> => {
  const filtersParams: Record<string, number | string> = {}
  if (filters.page) filtersParams.page = filters.page
  if (filters.limit) filtersParams.limit = filters.limit
  if (filters.search) filtersParams.search = filters.search
  if (filters.sortEventId) filtersParams.sortEventId = filters.sortEventId
  const response = await apiProxy.get('tf/events', {
    params: filtersParams,
  })
  return response.data.data as EventListResponse
}

export const useEventsList = () => {
  const [filters] = useQueryStates({
    limit: parseAsInteger.withDefault(10),
    keyword: parseAsString.withDefault(''),
    eventId: parseAsString.withDefault(''),
  })

  const query = useInfiniteQuery({
    queryKey: ['trade-fair-event-list', filters],
    queryFn: ({ pageParam }) => fetchEventsList({
      page: pageParam,
      limit: filters.limit,
      search: filters.keyword,
      sortEventId: filters.eventId,
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (
      lastPage.pagination?.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined
    ),
  })

  return {
    eventsList: query.data?.pages.flatMap((page) => Array.isArray(page?.items) ? page.items : []) ?? [],
    isEventsListLoading: query.isLoading,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  }
}
