import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import {
  refreshEventMutationQueries,
  type EventMutationRefreshScope,
} from '../(helpers)/event-mutation-refresh';

export type AddProductToEventPayload = {
  eventId: string;
  sku: string;
  quantity: number;
  isRentEntirePeriod: boolean;
};

const addProductToEventApi = async (payload: AddProductToEventPayload): Promise<void> => {
  await apiProxy.post('/etr/event-products/add-to-event', payload);
};

type UseAddProductToEventOptions = {
  refreshScope?: EventMutationRefreshScope;
  errorMessageKey?: 'errorAddProduct' | 'errorUpdateQuantity';
};

export function useAddProductToEvent({
  refreshScope = { type: 'cart' },
  errorMessageKey = 'errorAddProduct',
}: UseAddProductToEventOptions = {}) {
  const queryClient = useQueryClient();
  const t = useTranslations('eventForm.productCatalog');

  return useMutation({
    mutationFn: addProductToEventApi,
    onSuccess: (_, variables) => {
      toast.success(t('successAddProduct'));
      // Refresh the event cart and step-detail cost data.
      queryClient.invalidateQueries({ queryKey: ['event-products-cart', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-step-detail', variables.eventId] });
    },
    onError: (error, variables) => {
      console.error('Failed to add product to event:', error);
      void refreshEventMutationQueries(queryClient, variables.eventId, refreshScope);
      if (!(error as { response?: unknown }).response) {
        toast.error(t(errorMessageKey));
      }
    },
  });
}
