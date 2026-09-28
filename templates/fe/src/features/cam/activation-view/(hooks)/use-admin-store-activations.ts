"use client";

import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { apiProxy } from "@/lib/api";
import type { PaginationType } from "@/shared/types/pagination-type";

export type StoreActivationItem = {
  id: string;
  name: string;
  owner: { name?: string; fullName?: string } | string | null;
  status: string;
  createdBy: unknown;
  updatedAt: string | null;
  evaluation: { maxScore: number; score: number } | null;
};

type StoreActivationsResponse = {
  items: StoreActivationItem[];
  pagination: PaginationType;
};

async function fetchStoreActivations(
  storeId: string,
  params: { page: number; limit: number; search: string; sortBy: string },
): Promise<StoreActivationsResponse> {
  const { data } = await apiProxy.get<{ data: StoreActivationsResponse }>(
    `/cam/stores-admin/${storeId}/activations`,
    {
      params: {
        page: params.page,
        limit: params.limit,
        ...(params.search ? { search: params.search } : {}),
        ...(params.sortBy ? { sortBy: params.sortBy } : {}),
      },
    },
  );
  return data.data;
}

export function useAdminStoreActivations(storeId: string | null) {
  const [filters, setFilters] = useQueryStates({
    storeActPage: parseAsInteger.withDefault(1),
    storeActLimit: parseAsInteger.withDefault(10),
    storeActSearch: parseAsString.withDefault(""),
    storeActSort: parseAsString.withDefault(""),
  });

  const query = useQuery({
    queryKey: ["cam-admin-store-activations", storeId, filters],
    queryFn: () =>
      fetchStoreActivations(storeId!, {
        page: filters.storeActPage,
        limit: filters.storeActLimit,
        search: filters.storeActSearch,
        sortBy: filters.storeActSort,
      }),
    enabled: !!storeId,
  });

  return {
    items: query.data?.items ?? [],
    pagination: query.data?.pagination ?? null,
    isLoading: query.isLoading,
    search: filters.storeActSearch,
    sortBy: filters.storeActSort,
    page: filters.storeActPage,
    limit: filters.storeActLimit,
    setSearch: (search: string) =>
      setFilters({ storeActSearch: search, storeActPage: 1 }),
    setSortBy: (sortBy: string) =>
      setFilters({ storeActSort: sortBy, storeActPage: 1 }),
    goToPage: (page: number) => setFilters({ storeActPage: page }),
    setLimit: (limit: number) =>
      setFilters({ storeActLimit: limit, storeActPage: 1 }),
  };
}
