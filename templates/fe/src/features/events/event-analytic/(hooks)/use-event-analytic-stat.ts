'use client'

import { useQuery } from '@tanstack/react-query'
import { apiProxy } from '@/lib/api'

export type EventAnalyticStatResponse = {
  total: number
  completed: number
  incomplete: number
}

export function useEventAnalyticStat() {
  return useQuery({
    queryKey: ['events-stats'],
    queryFn: async () => {
      const response = await apiProxy.get<{ data: EventAnalyticStatResponse }>('/etr/analytics/stats')
      return response.data.data
    },
  })
}
