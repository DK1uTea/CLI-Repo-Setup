'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';

export type CamUser = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
};

type ListCamUsersResponse = {
  items: CamUser[];
  pagination: { page: number; limit: number; hasNextPage: boolean };
};

const LIMIT = 10;

async function fetchCamUsers({ search, page, limit }: { search?: string; page: number; limit: number }): Promise<ListCamUsersResponse> {
  const response = await apiProxy.get<{ data: ListCamUsersResponse }>('/cam/users', {
    params: { page, limit, ...(search ? { search } : {}) },
  });
  return response.data.data;
}

export function useListCamUsers(search: string, options?: { enabled?: boolean }) {
  const query = useInfiniteQuery({
    queryKey: ['cam-user-list', search],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchCamUsers({ search, page: pageParam, limit: LIMIT }),
    getNextPageParam: (lastPage) => (lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined),
    enabled: options?.enabled ?? true,
  });

  return {
    users: query.data?.pages.flatMap((page) => page.items) ?? [],
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
  };
}
