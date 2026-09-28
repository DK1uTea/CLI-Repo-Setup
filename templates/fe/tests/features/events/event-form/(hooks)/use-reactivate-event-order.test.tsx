import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { apiProxy } from '@/lib/api';
import { useReactivateEventOrder } from '@/features/events/event-form/(hooks)/use-reactivate-event-order';

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));
vi.mock('@/lib/api', () => ({
  apiProxy: { post: vi.fn() },
}));

function ReactivateOrderProbe() {
  const { reactivateOrder, isPending } = useReactivateEventOrder();
  const [result, setResult] = useState<string>('idle');

  return (
    <div>
      <p>{isPending ? 'pending' : 'idle'}</p>
      <p>{result}</p>
      <button
        type="button"
        onClick={async () => setResult((await reactivateOrder('event-1')) ? 'ok' : 'failed')}
      >
        reactivate
      </button>
    </div>
  );
}

function renderProbe() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined);
  const view = render(
    <QueryClientProvider client={queryClient}>
      <ReactivateOrderProbe />
    </QueryClientProvider>,
  );
  return { view, invalidate };
}

describe('useReactivateEventOrder', () => {
  it('posts the reactivate request for the event order and reports success', async () => {
    vi.mocked(apiProxy.post).mockResolvedValueOnce({ data: {} });
    const user = userEvent.setup();

    const { invalidate } = renderProbe();
    await user.click(screen.getByRole('button', { name: 'reactivate' }));

    expect(await screen.findByText('ok')).toBeInTheDocument();
    expect(apiProxy.post).toHaveBeenCalledWith('/etr/event-orders/event-1/reactive');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['event-products-cart', 'event-1'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['event-order-active-count', 'event-1'] });
  });

  it('reports failure when the reactivate request rejects', async () => {
    vi.mocked(apiProxy.post).mockRejectedValueOnce(new Error('network error'));
    const user = userEvent.setup();

    const { invalidate } = renderProbe();
    await user.click(screen.getByRole('button', { name: 'reactivate' }));

    expect(await screen.findByText('failed')).toBeInTheDocument();
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['event-products-cart', 'event-1'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['event-order-active-count', 'event-1'] });
  });
});
