'use client';

import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { apiProxy } from '@/lib/api';

type VisibilityPayload = {
  eventId: string;
  isPrivate: boolean;
};

async function patchEventVisibility({ eventId, isPrivate }: VisibilityPayload) {
  await apiProxy.patch(`/etr/events/${eventId}/visibility`, { isPrivate });
}

const VISIBILITY_MUTATION_KEY = ['event-visibility'] as const;

export function useEventVisibility() {
  const queryClient = useQueryClient();
  const t = useTranslations('eventForm');
  const mutating = useIsMutating({ mutationKey: VISIBILITY_MUTATION_KEY });

  const mutation = useMutation({
    mutationKey: VISIBILITY_MUTATION_KEY,
    mutationFn: patchEventVisibility,
    onSuccess: (_, { eventId, isPrivate }) => {
      toast.success(isPrivate ? t('visibilityPrivate') : t('visibilityPublic'));
      queryClient.invalidateQueries({ queryKey: ['event-step-detail', eventId] });
    },
  });

  return { ...mutation, isPending: mutation.isPending || mutating > 0 };
}
