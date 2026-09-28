'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchActivationParticipants } from '../(services)/activation-participants-service';

const LIMIT = 10;

// Membership rarely changes; add/remove participant already invalidates this key on success.
const PARTICIPANTS_STALE_TIME = 5 * 60 * 1000;

export function useListActivationParticipants(activationId?: string, options?: { enabled?: boolean }) {
  const query = useInfiniteQuery({
    queryKey: ['cam-activation-participants', activationId, 'infinite'],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchActivationParticipants({ activationId: activationId!, page: pageParam, limit: LIMIT }),
    getNextPageParam: (lastPage) => (lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined),
    enabled: !!activationId && (options?.enabled ?? true),
    staleTime: PARTICIPANTS_STALE_TIME,
    gcTime: PARTICIPANTS_STALE_TIME,
  });

  return {
    participants: query.data?.pages.flatMap((page) => page.items) ?? [],
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
  };
}
