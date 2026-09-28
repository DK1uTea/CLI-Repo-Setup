import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { apiProxy } from '@/lib/api';
import { useEventDeadline } from '@/features/events/event-form/(hooks)/use-event-deadline';

vi.mock('@/lib/api', () => ({
  apiProxy: { get: vi.fn() },
}));

const DEADLINE = {
  referenceDate: '2026-07-16',
  countryCode: 'DE',
  workingDays: 10,
  deadline: '2026-07-30',
};

function DeadlineProbe({ enabled = true }: { enabled?: boolean }) {
  const { data, isError } = useEventDeadline(enabled);

  if (isError) return <p>deadline-error</p>;
  return <p>{data?.deadline ?? 'loading'}</p>;
}

function renderProbe(enabled = true) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <DeadlineProbe enabled={enabled} />
      </QueryClientProvider>,
    ),
  };
}

describe('useEventDeadline', () => {
  it('gets the server-defined deadline through the ETR browser proxy', async () => {
    vi.mocked(apiProxy.get).mockResolvedValueOnce({ data: { data: DEADLINE } });

    renderProbe();

    expect(await screen.findByText('2026-07-30')).toBeInTheDocument();
    expect(apiProxy.get).toHaveBeenCalledWith('/etr/holidays/deadline', { _skipToast: true });
  });

  it('fails when the successful response does not contain a usable deadline', async () => {
    vi.mocked(apiProxy.get).mockResolvedValueOnce({ data: { data: { ...DEADLINE, deadline: '' } } });

    renderProbe();

    expect(await screen.findByText('deadline-error')).toBeInTheDocument();
  });

  it('reuses the deadline cache when a later wizard step enables the query', async () => {
    vi.mocked(apiProxy.get).mockResolvedValueOnce({ data: { data: DEADLINE } });

    const view = renderProbe();
    await screen.findByText('2026-07-30');

    view.rerender(
      <QueryClientProvider client={view.queryClient}>
        <DeadlineProbe enabled={false} />
      </QueryClientProvider>,
    );
    view.rerender(
      <QueryClientProvider client={view.queryClient}>
        <DeadlineProbe />
      </QueryClientProvider>,
    );

    expect(await screen.findByText('2026-07-30')).toBeInTheDocument();
    expect(apiProxy.get).toHaveBeenCalledTimes(1);
  });
});
