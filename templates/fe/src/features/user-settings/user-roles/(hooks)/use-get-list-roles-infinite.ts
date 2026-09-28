'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { apiProxy } from '@/lib/api'
import type { Role } from './use-get-list-roles'

const LIMIT = 10

type ListRolesPage = {
  roles: Role[]
  nextPage: number | null
}

type RolesResponse = {
  data?: {
    items?: Role[]
    pagination?: { hasNextPage: boolean; page: number }
  }
}

async function fetchRolesPage(page: number): Promise<ListRolesPage> {
  const response = await apiProxy.get<RolesResponse>('/roles', {
    params: { page, limit: LIMIT },
  })
  const data = response.data?.data
  const pagination = data?.pagination
  return {
    roles: data?.items ?? [],
    nextPage: pagination?.hasNextPage ? page + 1 : null,
  }
}

export function useGetListRolesInfinite() {
  return useInfiniteQuery({
    queryKey: ['roles-list-infinite'],
    queryFn: ({ pageParam }) => fetchRolesPage(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  })
}
