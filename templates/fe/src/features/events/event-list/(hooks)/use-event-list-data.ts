'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { apiProxy } from '@/lib/api'
import { REPEATED_ARRAY_PARAMS_SERIALIZER } from '@/lib/query-params'
import type { PaginationType } from '@/shared/types/pagination-type'

export type EventStatus = 'ACTIVE' | 'DRAFT' | 'DELETED'

export type CalendarGuest = {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
}

export type EventItem = {
  id: string
  title: string
  status: EventStatus
  startDate: string
  endDate: string
  createdAt?: string
  step: number
  type: string
  adminContact?: {
    name: string
    email: string
  }
  isOwner?: boolean
}

export type EventMonthGroup = {
  month: string
  total: number
  events: EventItem[]
}

export type EventListResponse = {
  items: EventMonthGroup[]
  pagination?: PaginationType
}

export type EventListParams = {
  keyword?: string
  status?: string | null
  event_type?: string | null
  timeFrame?: string | null
  my_event?: string | null
  userId?: string | null
  targetAudience?: string | null
  partnershipTypes?: string | null
  productPartnerCategories?: string | null
  limit?: string | null
  start_date?: string | null
  end_date?: string | null
}

export function mergeEventMonthGroups(groups: EventMonthGroup[]): EventMonthGroup[] {
  const merged = new Map<string, EventMonthGroup>()

  for (const group of groups) {
    const events = Array.isArray(group?.events) ? group.events : []
    const current = merged.get(group.month)
    if (current) {
      current.events.push(...events)
      current.total = current.events.length
    } else {
      merged.set(group.month, { ...group, total: events.length, events: [...events] })
    }
  }

  return [...merged.values()]
}

export function useEventListData(
  params: EventListParams,
  options: { enabled?: boolean } | boolean = true,
) {
  const enabled = typeof options === 'boolean' ? options : options.enabled ?? true

  return useInfiniteQuery({
    queryKey: ['event-list', params],
    enabled,
    queryFn: async ({ pageParam }): Promise<EventListResponse> => {
      const queryParams: Record<string, any> = {
        sort: 'createdAt:desc',
        page: pageParam,
        limit: params.limit ? Number(params.limit) : 10,
      }

      if (params.keyword) queryParams.search = params.keyword
      if (params.status && params.status !== 'all') {
        queryParams.status = params.status.toUpperCase()
      }
      if (params.event_type && params.event_type !== 'all') {
        queryParams.eventTypeId = params.event_type
      }
      if (params.userId && params.userId !== 'all') {
        queryParams.createdBy = params.userId
      }
      if (params.timeFrame && params.timeFrame !== 'all') {
        queryParams.timeFrame = params.timeFrame
      }
      if (params.start_date) queryParams.startDate = params.start_date
      if (params.end_date) queryParams.endDate = params.end_date

      if (params.partnershipTypes) {
        queryParams.partnershipTypes = params.partnershipTypes.split(',')
      }
      if (params.productPartnerCategories) {
        queryParams.productPartnerCategories = params.productPartnerCategories.split(',')
      }
      if (params.targetAudience) {
        queryParams.targetAudience = params.targetAudience.split(',')
      }

      queryParams.onlyMine = params.my_event === 'true'

      const response = await apiProxy.get<{ data: EventListResponse }>('/etr/events', {
        params: queryParams,
        paramsSerializer: REPEATED_ARRAY_PARAMS_SERIALIZER,
      })
      const data = response.data.data

      return {
        items: Array.isArray(data?.items) ? data.items : [],
        pagination: data?.pagination,
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.pagination?.hasNextPage
      ? lastPage.pagination.page + 1
      : undefined,
    staleTime: 0,
  })
}
