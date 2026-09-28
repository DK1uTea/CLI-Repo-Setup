'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';
import type { PaginationType } from '@/shared/types/pagination-type';
import type { OwnershipTransferCandidate } from '../(services)/event-common-service';

const PER_PAGE = 10;

type OwnershipTransferCandidatesEnvelope = {
  data?: { items?: OwnershipTransferCandidate[]; pagination?: PaginationType };
};

async function getOwnershipTransferCandidates(params: { page: number; limit: number; search?: string }) {
  const response = await apiProxy.get<OwnershipTransferCandidatesEnvelope>(
    'etr/users/ownership-transfer-candidates',
    { params },
  );
  const items = response.data?.data?.items;
  return {
    candidates: Array.isArray(items) ? items : [],
    pagination: response.data?.data?.pagination ?? null,
  };
}

export function useOwnershipTransferCandidates(search: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: ['ownership-transfer-candidates', search],
    queryFn: ({ pageParam }) => getOwnershipTransferCandidates({ page: pageParam, limit: PER_PAGE, search: search || undefined }),
    getNextPageParam: (lastPage) => (lastPage.pagination?.hasNextPage ? lastPage.pagination.page + 1 : undefined),
    initialPageParam: 1,
    enabled,
  });
}
