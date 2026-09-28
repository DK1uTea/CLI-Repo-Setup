'use client'

import { useQuery } from '@tanstack/react-query'
import { apiProxy } from '@/lib/api'
import { REPEATED_ARRAY_PARAMS_SERIALIZER } from '@/lib/query-params'
import type { EventStatus } from '@/features/events/event-list/(hooks)/use-event-list-data'

export type CalendarEvent = {
  id: string
  title: string
  status: EventStatus
  startDate: string
  endDate: string
  createdAt?: string
  step: number
  type: string
  isOwner?: boolean
  city?: string
  address?: string
  description?: string
  adminContact?: {
    name: string
    email?: string
  }
}

export type EventCalendarResponse = {
  items: CalendarEvent[]
}

export type EventCalendarParams = {
  startDate: string
  endDate: string
  keyword?: string
  status?: string | null
  event_type?: string | null
  my_event?: string | null
  userId?: string | null
  targetAudience?: string | null
  partnershipTypes?: string | null
  productPartnerCategories?: string | null
}

export function useEventCalendarData(params: EventCalendarParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['event-calendar', params],
    queryFn: async (): Promise<EventCalendarResponse> => {
      const queryParams: Record<string, any> = {
        startDate: params.startDate,
        endDate: params.endDate,
        sort: 'createdAt:desc',
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

      const response = await apiProxy.get<{ data: EventCalendarResponse }>('/etr/events/calendar-table', {
        params: queryParams,
        paramsSerializer: REPEATED_ARRAY_PARAMS_SERIALIZER,
      })
      const data = response.data.data

      return data ?? { items: [] }
    },
    staleTime: 0,
    ...options,
  })
}
