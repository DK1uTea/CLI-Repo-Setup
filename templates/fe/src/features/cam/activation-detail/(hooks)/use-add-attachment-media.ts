'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';

export type AttachmentMediaType = 'ahMarketMediaUrls' | 'aMarketMediaUrls';

type AddAttachmentMediaDto = {
  activationId: string;
  type: AttachmentMediaType;
  urls: string[];
};

async function addAttachmentMedia({ activationId, type, urls }: AddAttachmentMediaDto) {
  const { data } = await apiProxy.patch(`/cam/activations/${activationId}/media`, { type, urls });
  return data;
}

export function useAddAttachmentMedia(activationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: Omit<AddAttachmentMediaDto, 'activationId'>) =>
      addAttachmentMedia({ activationId, ...dto }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cam-activation-detail', activationId] });
      queryClient.invalidateQueries({ queryKey: ['cam-activations-grouped'] });
      queryClient.invalidateQueries({ queryKey: ['cam-activation-admin-list'] });
    },
  });
}
