"use client";

import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { apiProxy } from "@/lib/api";
import type { PaginationType } from "@/shared/types/pagination-type";

export type StoreAdminItem = {
  id: string;
  storeName: string;
  storeAddress: string;
  updatedAt: string;
  contactName: string;
  activationCount: number;
  status: string;
};

type StoreAdminListResponse = {
  items: StoreAdminItem[];
  pagination: PaginationType;
};

async function fetchAdminStores(params: {
  page: number;
  limit: number;
  search: string;
  sortBy: string;
  status: string;
}): Promise<StoreAdminListResponse> {
  const { data } = await apiProxy.get<{ data: StoreAdminListResponse }>(
    "/cam/stores-admin",
    {
      params: {
        page: params.page,
        limit: params.limit,
        ...(params.search ? { search: params.search } : {}),
        ...(params.sortBy ? { sortBy: params.sortBy } : {}),
        ...(params.status ? { status: params.status } : {}),
      },
    },
  );
  return data.data;
}

export function useAdminStoreList() {
  const [filters, setFilters] = useQueryStates({
    storeAdPage: parseAsInteger.withDefault(1),
    storeAdLimit: parseAsInteger.withDefault(10),
    storeAdSearch: parseAsString.withDefault(""),
    storeAdSort: parseAsString.withDefault(""),
    storeAdStatus: parseAsString.withDefault(""),
  });

  const query = useQuery({
    queryKey: ["cam-admin-stores", filters],
    queryFn: () =>
      fetchAdminStores({
        page: filters.storeAdPage,
        limit: filters.storeAdLimit,
        search: filters.storeAdSearch,
        sortBy: filters.storeAdSort,
        status: filters.storeAdStatus,
      }),
  });

  return {
    items: query.data?.items ?? [],
    pagination: query.data?.pagination ?? null,
    isLoading: query.isLoading,
    page: filters.storeAdPage,
    limit: filters.storeAdLimit,
    search: filters.storeAdSearch,
    sortBy: filters.storeAdSort,
    status: filters.storeAdStatus,
    goToPage: (page: number) => setFilters({ storeAdPage: page }),
    setLimit: (limit: number) =>
      setFilters({ storeAdLimit: limit, storeAdPage: 1 }),
    setSearch: (search: string) =>
      setFilters({ storeAdSearch: search, storeAdPage: 1 }),
    setSortBy: (sortBy: string) =>
      setFilters({ storeAdSort: sortBy, storeAdPage: 1 }),
    setStatus: (status: string) =>
      setFilters({ storeAdStatus: status, storeAdPage: 1 }),
  };
}
