'use client'

import { useQuery } from '@tanstack/react-query'
import { parseAsString, parseAsInteger, useQueryStates } from 'nuqs'
import { apiProxy } from '@/lib/api'
import type { PaginationType } from '@/shared/types/pagination-type'

export type EventLocation = {
  id: string
  name: string
  street: string
  street2?: string | null
  city: string
  postalCode: string
  state?: string | null
  countryCode?: string
  country?: string
  latitude?: number
  longitude?: number
  status?: 'ACTIVE' | 'INACTIVE'
  createdAt?: string
}

export type EventLocationResponse = {
  items: EventLocation[]
  pagination: PaginationType
}

function mapSortParam(sortValue: string): string {
  const [field, direction] = sortValue.split(':')
  let apiField = field
  if (field === 'venue_name') apiField = 'name'
  else if (field === 'created_at') apiField = 'createdAt'
  else if (field === 'postal_code') apiField = 'postalCode'
  else if (field === 'city') apiField = 'city'

  return `${apiField}:${direction || 'desc'}`
}

export function useEventLocationPagination() {
  const [filters, setFilters] = useQueryStates({
    keyword: parseAsString.withDefault(''),
    sort: parseAsString.withDefault('created_at:desc'),
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
  })

  const apiSort = mapSortParam(filters.sort)

  const query = useQuery({
    queryKey: ['event-locations', filters.keyword, filters.sort, filters.page, filters.limit],
    queryFn: async () => {
      const response = await apiProxy.get<{ data: EventLocationResponse }>('/etr/locations/list', {
        params: {
          search: filters.keyword.trim() || undefined,
          sort: apiSort,
          page: filters.page,
          limit: filters.limit,
        },
      })
      return response.data.data
    },
  })

  return {
    query,
    filters,
    setFilters,
  }
}
