'use client'

import { useQuery } from '@tanstack/react-query'
import { parseAsString, useQueryStates } from 'nuqs'
import { apiProxy } from '@/lib/api'

export type ActivationItemCardType = {
  id: string
  name: string
  storeAddress: string
  status: string
  owner: string
  isOwner: boolean
  fileCount: number
  chatCount: number
  evaluation: {
    maxScore: number
    score: number
  } | null
}

export type ActivationGroupType = {
  status: string
  items: ActivationItemCardType[]
}

export type GetActivationsGroupResponse = {
  groups: ActivationGroupType[]
}

async function fetchActivationsGroup(params: {
  search?: string
  sortBy?: string
}): Promise<GetActivationsGroupResponse> {
  const response = await apiProxy.get<{ data: GetActivationsGroupResponse }>(
    '/cam/activations/grouped',
    {
      params: {
        ...(params.search ? { search: params.search } : {}),
        sortBy: params.sortBy || 'NAME_ASC',
      },
    }
  )
  return response.data.data
}

export function useGetActivationsGroup(params?: {
  search?: string
  sortBy?: string
}) {
  const [filters] = useQueryStates({
    keyword: parseAsString.withDefault(''),
    sortBy: parseAsString.withDefault('NAME_ASC'),
  })

  const search = params?.search !== undefined ? params.search : filters.keyword
  const sortBy = params?.sortBy !== undefined ? params.sortBy : filters.sortBy

  const query = useQuery({
    queryKey: ['cam-activations-grouped', { search, sortBy }],
    queryFn: () =>
      fetchActivationsGroup({
        search: search || undefined,
        sortBy: sortBy || undefined,
      }),
  })

  return {
    groups: query.data?.groups ?? [],
    isLoading: query.isLoading || query.isFetching,
    refetch: query.refetch,
  }
}
