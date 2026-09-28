'use client'

import { useQuery } from '@tanstack/react-query'
import { apiProxy } from '@/lib/api'
import type { PaginationType } from '@/shared/types/pagination-type'

export type UserAccessRole = {
  id: string
  name: string
}

export type UserAccess = {
  id: string
  email: string
  firstName: string
  lastName: string
  status: string
  role: UserAccessRole
  invitationId: string
  isAllowGiveAccess: boolean
  isAllowRemoveUser: boolean
  isAllowRevoke: boolean
  isExpired: boolean
  lastLoginAt?: string | null
  createdAt?: string
  inviteBy?: string
}

type ListUserAccessResponse = {
  data?: {
    users?: UserAccess[]
    pagination?: PaginationType
  }
}

type Params = {
  page?: number
  limit?: number
  keyword?: string
  roleId?: string
  sort?: string
  search?: string
  filter?: string
}

async function fetchListUserAccess(params: Params) {
  const response = await apiProxy.get<ListUserAccessResponse>('/user/access-users', { params })
  const data = response.data?.data
  return {
    users: data?.users ?? [],
    pagination: data?.pagination ?? null,
  }
}

export function useGetListUserAccess(params: Params = {}) {
  return useQuery({
    queryKey: ['user-access-list', params],
    queryFn: () => fetchListUserAccess(params),
  })
}
