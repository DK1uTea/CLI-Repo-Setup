"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryState, parseAsInteger } from "nuqs";
import { apiProxy } from "@/lib/api";
import type { PaginationType } from "@/shared/types/pagination-type";

export type LoginSession = {
  id: string;
  device: string;
  browser: string | null;
  ipAddress: string;
  location?: string | null;
  isActive: boolean;
  lastActiveAt: string;
};

type LoginHistoriesResponse = {
  data: {
    items: LoginSession[];
    pagination: PaginationType;
  };
};

async function fetchLoginHistories(page: number) {
  const response = await apiProxy.get<LoginHistoriesResponse>("/auth/histories", {
    params: { page },
  });
  const items = response.data?.data?.items;
  return {
    sessions: Array.isArray(items) ? items : [],
    pagination: response.data?.data?.pagination ?? null,
  };
}

export function useLoginHistory() {
  const [page, setPage] = useQueryState("loginHistoryPage", parseAsInteger.withDefault(1));

  const { data, isLoading } = useQuery({
    queryKey: ["session-histories", page],
    queryFn: () => fetchLoginHistories(page),
  });

  return {
    sessions: data?.sessions ?? [],
    pagination: data?.pagination ?? null,
    isLoading,
    page,
    setPage,
  };
}
