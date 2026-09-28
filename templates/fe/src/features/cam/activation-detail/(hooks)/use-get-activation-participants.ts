'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchActivationParticipants } from '../(services)/activation-participants-service';

export type { ParticipantDetail } from '../(services)/activation-participants-service';

// Membership rarely changes; add/remove participant already invalidates this key on success.
const PARTICIPANTS_STALE_TIME = 5 * 60 * 1000;

export function useGetActivationParticipants({
  activationId,
  limit = 5,
  page = 1,
}: {
  activationId?: string;
  limit?: number;
  page?: number;
}) {
  return useQuery({
    queryKey: ['cam-activation-participants', activationId, limit, page],
    queryFn: () => fetchActivationParticipants({ activationId: activationId!, limit, page }),
    enabled: !!activationId,
    staleTime: PARTICIPANTS_STALE_TIME,
    gcTime: PARTICIPANTS_STALE_TIME,
  });
}
