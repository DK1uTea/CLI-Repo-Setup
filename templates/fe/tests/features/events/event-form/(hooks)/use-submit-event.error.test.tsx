import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSubmitEvent } from '@/features/events/event-form/(hooks)/use-submit-event';

const { post, push, errorToast } = vi.hoisted(() => ({
  post: vi.fn(),
  push: vi.fn(),
  errorToast: vi.fn(),
}));

vi.mock('@/lib/api', () => ({ apiProxy: { post } }));
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/en/events/update-event',
}));
vi.mock('nuqs', () => ({
  parseAsString: {},
  useQueryState: (key: string) => [key === 'eventId' ? 'event-1' : null],
}));
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: errorToast } }));

describe('useSubmitEvent error handling', () => {
  beforeEach(() => {
    post.mockReset();
    push.mockReset();
    errorToast.mockReset();
  });

  it('keeps the flow in place and refreshes only the current surface after a rejected finalize', async () => {
    post.mockRejectedValueOnce(new Error('availability changed'));
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined);
    const testWrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(
      () => useSubmitEvent({ refreshScope: { type: 'catalog' } }),
      { wrapper: testWrapper },
    );

    await act(async () => {
      await expect(result.current.submit()).resolves.toBe(false);
    });

    expect(push).not.toHaveBeenCalled();
    expect(errorToast).toHaveBeenCalledWith('submitError');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['event-products-cart', 'event-1'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['event-order-active-count', 'event-1'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['event-step-detail', 'event-1'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['products-list'] });
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: ['event-product-detail'] });
  });
});
