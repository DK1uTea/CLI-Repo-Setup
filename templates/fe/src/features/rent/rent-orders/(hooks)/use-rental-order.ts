'use client';

import { useEffect, useState } from "react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useQuery } from "@tanstack/react-query";

import { apiProxy } from "@/lib/api";
import type { PaginationType } from "@/shared/types/pagination-type";
import { rentalOrderSortByMap, type RentalOrder } from "../(helpers)/rental-order-map";

type RentalOrdersResponse = {
  items: RentalOrder[];
  pagination: PaginationType;
};

const fetchRentalOrders = async (params: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  sortBy?: string;
  from?: string;
  to?: string;
}): Promise<RentalOrdersResponse> => {
  const response = await apiProxy.get("etr/orders", { params });
  return response.data.data as RentalOrdersResponse;
};

export const useRentalOrder = () => {
  const [filters, setFilters] = useQueryStates({
    search: parseAsString.withDefault(""),
    status: parseAsString.withDefault(""),
    sort: parseAsString.withDefault("created_at_desc"),
    from: parseAsString,
    to: parseAsString,
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
  });

  const [prevSearch, setPrevSearch] = useState(filters.search);
  const [prevFrom, setPrevFrom] = useState(filters.from);
  const [prevTo, setPrevTo] = useState(filters.to);

  useEffect(() => {
    if (filters.search !== prevSearch || filters.from !== prevFrom || filters.to !== prevTo) {
      setPrevSearch(filters.search);
      setPrevFrom(filters.from);
      setPrevTo(filters.to);
      setFilters({ page: 1 });
    }
  }, [filters.search, filters.from, filters.to, prevSearch, prevFrom, prevTo, setFilters]);

  const queryParams = {
    page: filters.page,
    limit: filters.limit,
    sortBy: rentalOrderSortByMap[filters.sort] ?? "newest",
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.from ? { from: filters.from } : {}),
    ...(filters.to ? { to: filters.to } : {}),
  };

  const query = useQuery({
    queryKey: ["rental-orders", queryParams],
    queryFn: () => fetchRentalOrders(queryParams),
  });

  return {
    isLoading: query.isLoading,
    rentalOrders: Array.isArray(query.data?.items) ? query.data.items : [],
    pagination: query.data?.pagination,
    page: filters.page,
    limit: filters.limit,
    setFilters,
  };
};
