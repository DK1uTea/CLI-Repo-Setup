'use client';

import { useInfiniteQuery } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";

export type EventLocationItem = {
  id: string;
  name: string;
  street: string;
  street2?: string;
  city: string;
  postalCode: string;
  state: string;
  countryCode: string;
  country: string;
  latitude: number;
  longitude: number;
};

export type EventLocationResponse = {
  items: EventLocationItem[];
  meta: {
    nextCursor?: string;
    hasMore: boolean;
    limit: number;
  };
};

export type GetEventLocationParams = {
  limit?: number;
  sort?: string;
  search?: string;
  filter?: string;
};

const fetchEventLocations = async ({
  cursor,
  limit = 10,
  sort = 'createdAt:desc',
  search,
  filter,
}: {
  cursor?: string;
  limit?: number;
  sort?: string;
  search?: string;
  filter?: string;
}): Promise<EventLocationResponse> => {
  const params: Record<string, any> = {
    limit,
    sort,
  };
  if (cursor) {
    params.cursor = cursor;
  }
  if (search) {
    params.search = search;
  }
  if (filter) {
    params.filter = filter;
  }
  const response = await apiProxy.get('/etr/locations', { params });
  return response.data.data as EventLocationResponse;
};

export const useEventLocation = (params?: GetEventLocationParams) => {
  const limit = params?.limit ?? 10;
  const sort = params?.sort ?? 'createdAt:desc';
  const search = params?.search ?? '';
  const filter = params?.filter;

  const query = useInfiniteQuery({
    queryKey: ['event-locations', { limit, sort, search, filter }],
    queryFn: ({ pageParam }) =>
      fetchEventLocations({
        cursor: pageParam || undefined,
        limit,
        sort,
        search,
        filter,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.meta?.hasMore ? lastPage.meta.nextCursor : undefined;
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