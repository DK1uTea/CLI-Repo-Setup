'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';
import { dayjs } from '@/lib/date-utils';
import { PaginationType } from '@/shared/types/pagination-type';

export type ActivityType =
  | 'CREATED'
  | 'STATUS_UPDATED'
  | 'MEMBER_ADDED'
  | 'MEMBER_REMOVED'
  | 'ASSIGNED_TO'
  | 'DUE_DATE_CHANGED';

export type ActivityItem = {
  id: string;
  type: ActivityType;
  causerName: string;
  causerAvatar: string | null;
  createdAt: string;
  toStatus?: string;
  addedUserNames?: string[];
  removedUserNames?: string[];
  assignedToName?: string;
  newDueDate?: string;
};

// createdAt from BE can be an ISO string or a protobuf timestamp object
type ProtobufTimestamp = {
  seconds: { low: number; high: number; unsigned: boolean };
  nanos: number;
};

type ActivityItemApi = {
  id: string;
  type: string;
  causer?: { name?: string | null; avatar?: string | null } | null;
  createdAt: string | ProtobufTimestamp;
  metadata?: {
    to?: string;
    assigneeName?: string;
    newDueDate?: string;
    [key: string]: unknown;
  };
  addedUsers?: { userId: string; name: string }[];
  removedUsers?: { userId: string; name: string }[];
};

type ActivitiesResponse = {
  items: ActivityItemApi[];
  pagination: PaginationType;
};

type PageParam = { page: number; limit: number };

const RAW_TO_ACTIVITY_TYPE: Record<string, ActivityType | undefined> = {
  ACTIVATION_CREATED: 'CREATED',
  STATUS_UPDATED: 'STATUS_UPDATED',
  MEMBER_ADDED: 'MEMBER_ADDED',
  MEMBER_REMOVED: 'MEMBER_REMOVED',
  ASSIGNED_TO: 'ASSIGNED_TO',
  DUE_DATE_CHANGED: 'DUE_DATE_CHANGED',
};

const PAGE_SIZE = 10;

const parseActivityCreatedAt = (createdAt: string | ProtobufTimestamp): string => {
  if (typeof createdAt === 'string') return createdAt;
  const seconds = createdAt.seconds.low + createdAt.seconds.high * 2 ** 32;
  return dayjs.unix(seconds).toISOString();
};

const mapActivityItem = (item: ActivityItemApi): ActivityItem => ({
  id: item.id,
  type: (RAW_TO_ACTIVITY_TYPE[item.type] ?? item.type) as ActivityType,
  causerName: item.causer?.name ?? '',
  causerAvatar: item.causer?.avatar ?? null,
  createdAt: parseActivityCreatedAt(item.createdAt),
  toStatus: item.metadata?.to,
  addedUserNames: item.addedUsers?.map((u) => u.name),
  removedUserNames: item.removedUsers?.map((u) => u.name),
  assignedToName: item.metadata?.assigneeName,
  newDueDate: item.metadata?.newDueDate,
});

async function fetchActivationActivity(activationId: string, pageParam: PageParam): Promise<ActivitiesResponse> {
  const response = await apiProxy.get<{ data: ActivitiesResponse }>('/cam/activities', {
    params: { activationId, page: pageParam.page, limit: pageParam.limit },
  });
  return response.data.data;
}

export function useActivationActivity(activationId?: string) {
  const query = useInfiniteQuery({
    queryKey: ['cam-activation-activity', activationId],
    queryFn: ({ pageParam }) => fetchActivationActivity(activationId!, pageParam as PageParam),
    initialPageParam: { page: 1, limit: PAGE_SIZE } as PageParam,
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination.hasNextPage) return undefined;
      return { page: lastPage.pagination.page + 1, limit: PAGE_SIZE };
    },
    enabled: !!activationId,
  });

  const activities = query.data?.pages.flatMap((page) => page.items.map(mapActivityItem)) ?? [];
  const lastPagination = query.data?.pages[query.data.pages.length - 1]?.pagination;
  const remaining = Math.max(0, (lastPagination?.total ?? 0) - activities.length);

  return {
    activities,
    isLoading: query.isLoading,
    hasMore: !!query.hasNextPage,
    nextBatchSize: Math.min(remaining, PAGE_SIZE),
    loadMore: () => query.fetchNextPage(),
  };
}
