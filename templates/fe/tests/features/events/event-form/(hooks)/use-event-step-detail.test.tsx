import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { apiProxy } from '@/lib/api';
import { useEventStepDetail } from '@/features/events/event-form/(hooks)/use-event-step-detail';

vi.mock('@/lib/api', () => ({
  apiProxy: { get: vi.fn() },
}));

function StepDetailProbe({ enabled }: { enabled?: boolean }) {
  const { data } = useEventStepDetail('event-1', 'summary', { enabled });
  return <p>{data ? `general:${data.general.id}` : 'idle'}</p>;
}

function MissingStepDetailProbe() {
  const { data } = useEventStepDetail('event-1', null);
  return <p>{data ? 'loaded' : 'idle'}</p>;
}

function renderProbe(enabled?: boolean) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <StepDetailProbe enabled={enabled} />
    </QueryClientProvider>,
  );
}

describe('useEventStepDetail enabled option', () => {
  it('does not fetch when no supported detail step is supplied', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <MissingStepDetailProbe />
      </QueryClientProvider>,
    );

    expect(apiProxy.get).not.toHaveBeenCalled();
    expect(screen.getByText('idle')).toBeInTheDocument();
  });

  it('does not fetch when enabled is explicitly false', () => {
    renderProbe(false);

    expect(apiProxy.get).not.toHaveBeenCalled();
    expect(screen.getByText('idle')).toBeInTheDocument();
  });

  it('fetches by default when enabled is omitted', async () => {
    vi.mocked(apiProxy.get).mockResolvedValueOnce({ data: { data: { general: { id: 'event-1' } } } });

    renderProbe(undefined);

    expect(await screen.findByText('general:event-1')).toBeInTheDocument();
    expect(apiProxy.get).toHaveBeenCalledWith('/etr/events/event-1/detail/summary');
  });
});
