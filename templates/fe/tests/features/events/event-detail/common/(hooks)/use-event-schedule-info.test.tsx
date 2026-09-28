import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiProxy } from '@/lib/api';
import { useEventScheduleInfo } from '@/features/events/event-detail/common/(hooks)/use-event-schedule-info';

vi.mock('@/lib/api', () => ({
  apiProxy: {
    get: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useEventScheduleInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches schedule info for given event ID and returns setup, start, and teardown lists', async () => {
    const mockData = {
      setup: [
        {
          startDate: '2026-09-24T06:00:00.000Z',
          endDate: '2026-09-24T08:00:00.000Z',
          changedAt: '2026-09-24T05:00:00.000Z',
          changedBy: 'Admin User',
          changedByAvatar: 'https://example.com/avatar.png',
        },
      ],
      start: [
        {
          startDate: '2026-09-25T08:00:00.000Z',
          endDate: '2026-09-25T18:00:00.000Z',
          changedAt: '2026-09-24T05:00:00.000Z',
          changedBy: 'Admin User',
          changedByAvatar: null,
        },
      ],
      teardown: [],
    };

    vi.mocked(apiProxy.get).mockResolvedValue({
      data: {
        message: 'OK',
        status: 200,
        data: mockData,
      },
    });

    const { result } = renderHook(() => useEventScheduleInfo('event-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiProxy.get).toHaveBeenCalledWith('etr/events/event-123/schedule-info');
    expect(result.current.data).toEqual(mockData);
  });
});
