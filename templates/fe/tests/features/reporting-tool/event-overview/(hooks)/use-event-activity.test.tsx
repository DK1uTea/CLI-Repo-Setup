import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useEventActivity } from '@/features/reporting-tool/event-overview/(hooks)/use-event-activity';

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiProxy: { get } }));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <NuqsTestingAdapter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </NuqsTestingAdapter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useEventActivity', () => {
  it('exposes activities and pagination from the API response envelope', async () => {
    const activity = {
      id: 'activity-1',
      type: 'LEAD_UPDATED',
      metadata: null,
      createdAt: '2026-08-06T10:19:25.196Z',
      lead: { fullName: 'Max Mustermann', email: null, company: 'Supermarkt Max 2' },
      actor: { id: 'actor-1', name: 'Tu Anh' },
      survey: { id: 'survey-1', name: 'Monster Energy' },
    };
    const pagination = {
      page: 1,
      limit: 5,
      total: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    };
    get.mockResolvedValue({ data: { data: { items: [activity], pagination } } });

    const { result } = renderHook(() => useEventActivity('event-1', 5), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.eventActivity).toEqual([activity]);
    expect(result.current.eventActivityPagination).toEqual(pagination);
    expect(get).toHaveBeenCalledWith('tf/dashboard/activities', {
      params: { eventId: 'event-1', page: 1, limit: 5 },
    });
  });
});
