'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { apiProxy } from '@/lib/api'

type RoleItem = {
  id: string
  name: string
  description: string
  ipAccess: string
  createdBy: string
  isCore: boolean
  status: 'ACTIVE' | 'ARCHIVED'
}

type RolesListPayload = {
  roles?: RoleItem[]
  total: number
}

type RolesListResponse = {
  data: RolesListPayload
}

export type { RoleItem }

const PER_PAGE = 12

async function fetchRolesList({ pageParam = 1, keyword = '', showArchived = false }) {
  const { data } = await apiProxy.get<RolesListResponse>('/role/list', {
    params: {
      page: pageParam,
      perPage: PER_PAGE,
      ...(keyword && { keyword }),
      ...(showArchived && { status: 'ARCHIVED' }),
    },
  })
  return data.data
}

export function useRolesListData(keyword = '', showArchived = false) {
  return useInfiniteQuery({
    queryKey: ['roles-list', keyword, showArchived],
    queryFn: ({ pageParam }) =>
      fetchRolesList({ pageParam: pageParam as number, keyword, showArchived }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.flatMap((p) => p.roles ?? []).length
      return loaded < lastPage.total ? allPages.length + 1 : undefined
    },
    staleTime: 5 * 60 * 1000,
  })
}
