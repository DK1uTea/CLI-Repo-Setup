import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { apiProxy } from '@/lib/api';
import { useEventOrderActiveCount } from '@/features/events/event-form/(hooks)/use-event-order-active-count';

vi.mock('@/lib/api', () => ({
  apiProxy: { get: vi.fn() },
}));

function ActiveCountProbe({ eventId }: { eventId: string | null }) {
  const { data } = useEventOrderActiveCount(eventId);
  return <p>{data ? `total:${data.total}|haveActive:${data.haveActive}` : 'loading'}</p>;
}

function renderProbe(eventId: string | null) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ActiveCountProbe eventId={eventId} />
    </QueryClientProvider>,
  );
}

describe('useEventOrderActiveCount', () => {
  it('fetches the active order count for an event', async () => {
    vi.mocked(apiProxy.get).mockResolvedValueOnce({ data: { data: { total: 2, haveActive: true } } });

    renderProbe('event-1');

    expect(await screen.findByText('total:2|haveActive:true')).toBeInTheDocument();
    expect(apiProxy.get).toHaveBeenCalledWith('/etr/event-orders/event-1/active-count');
  });

  it('does not fetch when there is no eventId', () => {
    renderProbe(null);

    expect(apiProxy.get).not.toHaveBeenCalled();
  });
});
