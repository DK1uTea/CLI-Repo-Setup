"use client";

import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { apiProxy } from "@/lib/api";
import type { PaginationType } from "@/shared/types/pagination-type";

export type ActivationItem = {
  id: string;
  name: string;
  brandFit: string;
  status: string;
  owner: string;
  fileCount: number;
  activityCount: number;
  updatedAt?: string | null;
  evaluation: { maxScore: number; score: number } | null;
};

type ActivationListResponse = {
  items: ActivationItem[];
  pagination: PaginationType;
};

async function fetchActivationAdminList(params: {
  page: number;
  limit: number;
  search: string;
  sortBy: string;
}): Promise<ActivationListResponse> {
  const { data } = await apiProxy.get<{ data: ActivationListResponse }>(
    "/cam/activations-admin",
    {
      params: {
        page: params.page,
        limit: params.limit,
        sortBy: params.sortBy,
        ...(params.search ? { search: params.search } : {}),
      },
    },
  );
  return data.data;
}

export function useActivationAdminList() {
  const [filters, setFilters] = useQueryStates({
    actPage: parseAsInteger.withDefault(1),
    actLimit: parseAsInteger.withDefault(10),
    actSearch: parseAsString.withDefault(""),
    actSort: parseAsString.withDefault("NAME_ASC"),
  });

  const query = useQuery({
    queryKey: ["cam-activation-admin-list", filters],
    queryFn: () =>
      fetchActivationAdminList({
        page: filters.actPage,
        limit: filters.actLimit,
        search: filters.actSearch,
        sortBy: filters.actSort,
      }),
  });

  return {
    items: query.data?.items ?? [],
    pagination: query.data?.pagination ?? null,
    isLoading: query.isLoading,
    search: filters.actSearch,
    page: filters.actPage,
    limit: filters.actLimit,
    setSearch: (search: string) =>
      setFilters({ actSearch: search, actPage: 1 }),
    goToPage: (page: number) => setFilters({ actPage: page }),
    setLimit: (limit: number) => setFilters({ actLimit: limit, actPage: 1 }),
    sortBy: filters.actSort,
    setSortBy: (sortBy: string) => setFilters({ actSort: sortBy, actPage: 1 }),
  };
}
