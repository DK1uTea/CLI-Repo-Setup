"use client";

import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { apiProxy } from "@/lib/api";
import type { PaginationType } from "@/shared/types/pagination-type";

type StoreItem = {
  id: string;
  storeName: string;
  storeAddress: string;
};

type StoreListResponse = {
  items: StoreItem[];
  pagination: PaginationType;
};

const SORT_DEFAULT = "createdAt:desc";

async function fetchStores(params: {
  page: number;
  limit: number;
  search: string;
}): Promise<StoreListResponse> {
  const response = await apiProxy.get<{ data: StoreListResponse }>("/cam/stores", {
    params: {
      page: params.page,
      limit: params.limit,
      sort: SORT_DEFAULT,
      ...(params.search ? { search: params.search } : {}),
    },
  });
  return response.data.data;
}

export function useStoreList() {
  const [filters, setFilters] = useQueryStates({
    storePage: parseAsInteger.withDefault(1),
    storeLimit: parseAsInteger.withDefault(10),
    storeSearch: parseAsString.withDefault(""),
  });

  const query = useQuery({
    queryKey: ["cam-stores", filters.storePage, filters.storeLimit, filters.storeSearch],
    queryFn: () =>
      fetchStores({
        page: filters.storePage,
        limit: filters.storeLimit,
        search: filters.storeSearch,
      }),
  });

  function goToPage(page: number) {
    setFilters({ storePage: page });
  }

  function setSearch(search: string) {
    setFilters({ storeSearch: search, storePage: 1 });
  }

  const stores = (query.data?.items ?? []).map((s) => ({
    id: s.id,
    name: s.storeName,
    address: s.storeAddress,
  }));

  return {
    stores,
    pagination: query.data?.pagination ?? null,
    isLoading: query.isLoading,
    search: filters.storeSearch,
    page: filters.storePage,
    goToPage,
    setSearch,
  };
}
