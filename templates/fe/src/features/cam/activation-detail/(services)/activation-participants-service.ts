import { apiProxy } from '@/lib/api';
import { PaginationType } from '@/shared/types/pagination-type';

export type ParticipantDetail = {
  id: string;
  isAbleToDeleted: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
};

export type ActivationParticipantsResponse = {
  items: ParticipantDetail[];
  pagination: PaginationType;
};

export async function fetchActivationParticipants(params: {
  activationId: string;
  limit?: number;
  page?: number;
}): Promise<ActivationParticipantsResponse> {
  const response = await apiProxy.get<{ data: ActivationParticipantsResponse }>(
    '/cam/activations/participants',
    {
      params: {
        activationId: params.activationId,
        limit: params.limit,
        page: params.page,
      },
    },
  );
  return response.data.data;
}
