'use client';

import { useInfiniteQuery } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";
import { PaginationType } from "@/shared/types/pagination-type";

export type LocationItem = {
  id: string;
  locationName: string;
  street: string;
  postcode: string;
  city: string;
  createdAt?: string;
  updatedAt?: string;
  street2?: string | Record<string, never>;
  state?: string;
  country?: string;
  countryCode?: string;
  latitude?: number | Record<string, never>;
  longitude?: number | Record<string, never>;
  status?: string;
};

export type LocationListResponse = {
  items: LocationItem[];
  pagination: PaginationType;
};

export type GetLocationParams = {
  limit?: number;
  sort?: string;
  search?: string;
};

const fetchLocations = async ({
  pageParam = 1,
  limit = 10,
  sort = 'locationName:asc',
  search,
}: {
  pageParam: number;
  limit?: number;
  sort?: string;
  search?: string;
}): Promise<LocationListResponse> => {
  const params: Record<string, any> = {
    page: pageParam,
    limit,
    sort,
  };
  if (search) {
    params.search = search;
  }
  const response = await apiProxy.get('tf/locations', { params });
  return response.data.data as LocationListResponse;
};

export const useTradeFairLocation = (params?: GetLocationParams) => {
  const limit = params?.limit ?? 10;
  const sort = params?.sort ?? 'locationName:asc';
  const search = params?.search ?? '';

  const query = useInfiniteQuery({
    queryKey: ['trade-fair-locations', { limit, sort, search }],
    queryFn: ({ pageParam }) => fetchLocations({ pageParam, limit, sort, search }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });

  return {
    locations: query.data?.pages.flatMap((page) => page.items) ?? [],
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    query,
  };
};
