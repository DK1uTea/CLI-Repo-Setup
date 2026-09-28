import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export type RemoveProductFromEventPayload = {
  eventId: string;
  sku: string;
};

const removeProductFromEventApi = async ({ eventId, sku }: RemoveProductFromEventPayload): Promise<void> => {
  await apiProxy.delete(`/etr/event-products/remove-from-event/${eventId}/${sku}`);
};

export function useRemoveProductFromEvent() {
  const queryClient = useQueryClient();
  const t = useTranslations('eventForm.productCatalog');

  return useMutation({
    mutationFn: removeProductFromEventApi,
    onSuccess: (_, variables) => {
      toast.success(t('successRemoveProduct'));
      // Invalidate queries to refresh products list, the event cart, and step-detail cost data
      queryClient.invalidateQueries({ queryKey: ['products-list'] });
      queryClient.invalidateQueries({ queryKey: ['event-products-cart', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-step-detail', variables.eventId] });
    },
    onError: (error) => {
      console.error('Failed to remove product from event:', error);
      toast.error(t('errorRemoveProduct'));
    },
  });
}
