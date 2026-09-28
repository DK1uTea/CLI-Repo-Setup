'use client'

import { useQuery } from '@tanstack/react-query'

import { apiProxy } from '@/lib/api'
import { dayjs, nowUtc } from '@/lib/date-utils'

export type EventAnalyticsTurnoverFilter = 'past' | 'all'

export type EventAnalyticsTurnoverResponse = {
  range: {
    from: string
    to: string
  }
  totalTurnover: number
  months: Array<{
    label: string
    total: number
  }>
}

type EventAnalyticsTurnoverParams = {
  filter?: EventAnalyticsTurnoverFilter
  includeFuture?: boolean
}

export const useEventAnalyticsTurnover = ({
  filter = 'past',
  includeFuture = false,
}: EventAnalyticsTurnoverParams = {}) => {
  const currentYear = dayjs.utc(nowUtc()).year()
  const params = {
    from: `01-${currentYear}`,
    to: `12-${currentYear}`,
    filter,
    includeFuture,
  }

  return useQuery({
    queryKey: ['event-analytics-turnover', params],
    queryFn: async () => {
      const response = await apiProxy.get<{ data: EventAnalyticsTurnoverResponse }>(
        '/etr/analytics/turnover',
        { params },
      )

      return response.data.data
    },
  })
}
