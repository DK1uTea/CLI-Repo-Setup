import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { apiProxy } from '@/lib/api';
import { useEventProductsCart } from '@/features/events/event-form/(hooks)/use-event-products-cart';

vi.mock('@/lib/api', () => ({
  apiProxy: { get: vi.fn() },
}));

function CartProbe({ eventId, enabled }: { eventId: string; enabled?: boolean }) {
  const { data } = useEventProductsCart(eventId, { enabled });
  return <p>{data ? `items:${data.items.length}` : 'loading'}</p>;
}

function renderProbe(eventId: string, enabled?: boolean) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <CartProbe eventId={eventId} enabled={enabled} />
    </QueryClientProvider>,
  );
}

describe('useEventProductsCart', () => {
  it('fetches the event product cart from the dedicated cart endpoint', async () => {
    vi.mocked(apiProxy.get).mockResolvedValueOnce({
      data: { data: { items: [{ id: 'p1', sku: 'SKU-1', name: 'Product 1', quantity: 2 }] } },
    });

    renderProbe('event-1');

    expect(await screen.findByText('items:1')).toBeInTheDocument();
    expect(apiProxy.get).toHaveBeenCalledWith('/etr/event-products/cart/event-1');
  });

  it('does not fetch when enabled is explicitly false', () => {
    renderProbe('event-1', false);

    expect(apiProxy.get).not.toHaveBeenCalled();
  });

  it('does not fetch when there is no eventId', () => {
    renderProbe('');

    expect(apiProxy.get).not.toHaveBeenCalled();
  });
});
