import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { apiProxy } from '@/lib/api';
import { useCreateEventOrder } from '@/features/events/event-form/(hooks)/use-create-event-order';

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));
vi.mock('@/lib/api', () => ({
  apiProxy: { post: vi.fn() },
}));

function CreateOrderProbe() {
  const { createOrder, isPending } = useCreateEventOrder();
  const [result, setResult] = useState<string>('idle');

  return (
    <div>
      <p>{isPending ? 'pending' : 'idle'}</p>
      <p>{result}</p>
      <button
        type="button"
        onClick={async () => setResult((await createOrder('event-1')) ? 'ok' : 'failed')}
      >
        create
      </button>
    </div>
  );
}

function renderProbe() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined);
  const view = render(
    <QueryClientProvider client={queryClient}>
      <CreateOrderProbe />
    </QueryClientProvider>,
  );
  return { view, invalidate };
}

describe('useCreateEventOrder', () => {
  it('posts the same create-order request the summary step uses, and reports success', async () => {
    vi.mocked(apiProxy.post).mockResolvedValueOnce({ data: { data: { id: 'order-1' } } });
    const user = userEvent.setup();

    const { invalidate } = renderProbe();
    await user.click(screen.getByRole('button', { name: 'create' }));

    expect(await screen.findByText('ok')).toBeInTheDocument();
    expect(apiProxy.post).toHaveBeenCalledWith('/etr/events/event-1/summary');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['event-products-cart', 'event-1'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['event-order-active-count', 'event-1'] });
  });

  it('reports failure when the create-order request rejects', async () => {
    vi.mocked(apiProxy.post).mockRejectedValueOnce(new Error('network error'));
    const user = userEvent.setup();

    const { invalidate } = renderProbe();
    await user.click(screen.getByRole('button', { name: 'create' }));

    expect(await screen.findByText('failed')).toBeInTheDocument();
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['event-products-cart', 'event-1'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['event-order-active-count', 'event-1'] });
  });
});
