import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import { refreshEventMutationQueries } from '@/features/events/event-form/(helpers)/event-mutation-refresh';

describe('refreshEventMutationQueries', () => {
  it('refreshes only the catalog surface plus the cart', async () => {
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined);

    await refreshEventMutationQueries(queryClient, 'event-1', { type: 'catalog' });

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['event-products-cart', 'event-1'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['products-list'] });
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: ['products-helping-hands-list'] });
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: ['event-product-detail'] });
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: ['event-order-active-count', 'event-1'] });
  });

  it('adds order and step-detail refreshes without touching unrelated product surfaces', async () => {
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined);

    await refreshEventMutationQueries(
      queryClient,
      'event-1',
      { type: 'product-detail', slug: 'chair' },
      { includeActiveOrder: true, includeStepDetail: true },
    );

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['event-products-cart', 'event-1'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['event-order-active-count', 'event-1'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['event-step-detail', 'event-1'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['event-product-detail', 'chair', 'event-1'] });
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: ['products-list'] });
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: ['products-helping-hands-list'] });
  });
});
