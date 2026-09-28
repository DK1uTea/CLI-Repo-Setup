'use client'

import { useRolesListData, type RoleItem } from './use-roles-list-data'

export type { RoleItem as Role }

type Filters = {
  keyword?: string
  showArchived?: boolean
}

export function useManageRolesData({ keyword = '', showArchived = false }: Filters = {}) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useRolesListData(keyword, showArchived)

  const roles = data?.pages.flatMap((p) => p.roles ?? []) ?? []

  return {
    roles,
    total: data?.pages[0]?.total ?? 0,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  }
}
