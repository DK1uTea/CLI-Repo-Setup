'use client'

import { useQuery } from '@tanstack/react-query'
import { apiProxy } from '@/lib/api'
import type { PaginationType } from '@/shared/types/pagination-type'

export type Role = {
  id: string
  name: string
  description: string
  isSystem: boolean
  permissions: string[]
  updatedAt: string
  createdBy?: string
  status?: string
  ip?: string
}

type ListRolesResponse = {
  data?: {
    items?: Role[]
    pagination?: PaginationType
  }
}

type Params = {
  page?: number
  limit?: number
  search?: string
  sort?: string
  filter?: string
  onlyDeleted?: boolean
}

async function fetchListRoles(params: Params) {
  const response = await apiProxy.get<ListRolesResponse>('/roles', { params })
  const data = response.data?.data
  return {
    roles: data?.items ?? [],
    pagination: data?.pagination ?? null,
  }
}

export function useGetListRoles(params: Params = {}) {
  return useQuery({
    queryKey: ['roles-list', params],
    queryFn: () => fetchListRoles(params),
  })
}
