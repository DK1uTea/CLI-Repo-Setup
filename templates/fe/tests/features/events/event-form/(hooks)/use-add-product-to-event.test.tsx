import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAddProductToEvent } from '@/features/events/event-form/(hooks)/use-add-product-to-event';

const { post, success, error } = vi.hoisted(() => ({
  post: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock('@/lib/api', () => ({ apiProxy: { post } }));
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('sonner', () => ({ toast: { success, error } }));

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { invalidate, wrapper };
}

beforeEach(() => {
  vi.clearAllMocks();
  post.mockResolvedValue(undefined);
});

describe('useAddProductToEvent', () => {
  it('refreshes the cart and cost data without invalidating the product list', async () => {
    const view = setup();
    const { result } = renderHook(() => useAddProductToEvent(), { wrapper: view.wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        eventId: 'event-1',
        sku: 'sku-1',
        quantity: 2,
        isRentEntirePeriod: true,
      });
    });

    await waitFor(() => expect(view.invalidate).toHaveBeenCalledTimes(2));
    expect(view.invalidate).toHaveBeenCalledWith({
      queryKey: ['event-products-cart', 'event-1'],
    });
    expect(view.invalidate).toHaveBeenCalledWith({
      queryKey: ['event-step-detail', 'event-1'],
    });
    expect(view.invalidate).not.toHaveBeenCalledWith({ queryKey: ['products-list'] });
    expect(success).toHaveBeenCalledWith('successAddProduct');
  });

  it('refreshes only the failed mutation surface and reports the error', async () => {
    post.mockRejectedValueOnce(new Error('availability changed'));
    const view = setup();
    const { result } = renderHook(
      () => useAddProductToEvent({ refreshScope: { type: 'helping-hand' } }),
      { wrapper: view.wrapper },
    );

    await act(async () => {
      await expect(result.current.mutateAsync({
        eventId: 'event-1',
        sku: 'sku-1',
        quantity: 2,
        isRentEntirePeriod: true,
      })).rejects.toThrow('availability changed');
    });

    expect(view.invalidate).toHaveBeenCalledWith({ queryKey: ['event-products-cart', 'event-1'] });
    expect(view.invalidate).toHaveBeenCalledWith({ queryKey: ['products-helping-hands-list'] });
    expect(view.invalidate).not.toHaveBeenCalledWith({ queryKey: ['products-list'] });
    expect(error).toHaveBeenCalledWith('errorAddProduct');
  });
});
