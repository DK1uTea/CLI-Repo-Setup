'use client';

import { useQuery } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';
import { PaginationType } from '@/shared/types/pagination-type';

export type FeedbackCreator = {
  userId: string;
  name: string | null;
  avatar: string | null;
};

export type Feedback = {
  id: string;
  reason: string;
  type: string;
  resolved: boolean;
  createdAt: string;
  createdBy: FeedbackCreator;
};

type GetActivationFeedbacksResponse = {
  items: Feedback[];
  pagination: PaginationType;
};

async function fetchActivationFeedbacks(activationId: string): Promise<Feedback[]> {
  const response = await apiProxy.get<{ data: GetActivationFeedbacksResponse }>(`/cam/feedbacks`, {
    params: {
      activationId,
    },
  });
  return response.data.data.items;
}

export function useGetActivationFeedbacks(activationId?: string) {
  return useQuery({
    queryKey: ['cam-activation-feedbacks', activationId],
    queryFn: () => fetchActivationFeedbacks(activationId!),
    enabled: !!activationId,
  });
}
