'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';

export type ActivationContact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  tel: string;
  address: string;
};

// The list endpoint returns a summary shape — a single combined `name`, no address —
// unlike the detail/lookup endpoints which return structured firstName/lastName/address.
export type ActivationContactListItem = {
  id: string;
  name: string;
  email: string;
  tel: string;
  isOwner: boolean;
};

type ListContactsResponse = {
  items: ActivationContactListItem[];
  pagination: { page: number; limit: number; hasNextPage: boolean };
};

const LIMIT = 10;


async function fetchContactsPage(activationId: string, page: number, limit: number): Promise<ListContactsResponse> {
  const response = await apiProxy.get<{ data: ListContactsResponse }>('/cam/contacts', {
    params: { activationId, page, limit },
  });
  return response.data.data;
}

export const CONTACTS_QUERY_KEY = 'cam-activation-contacts';

export function useListContacts(activationId?: string, options?: { enabled?: boolean }) {
  const query = useInfiniteQuery({
    queryKey: [CONTACTS_QUERY_KEY, activationId],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchContactsPage(activationId!, pageParam, LIMIT),
    getNextPageParam: (lastPage) => (lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined),
    enabled: !!activationId && (options?.enabled ?? true),
  });

  return {
    contacts: query.data?.pages.flatMap((page) => page.items) ?? [],
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading || (query.isFetching && !query.isFetchingNextPage),
  };
}
