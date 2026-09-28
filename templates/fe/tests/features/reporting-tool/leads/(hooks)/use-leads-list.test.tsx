import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useLeadsList } from '@/features/reporting-tool/leads/(hooks)/use-leads-list';

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiProxy: { get } }));

function setup(searchParams = '?eventId=event-1') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <NuqsTestingAdapter searchParams={searchParams} hasMemory>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </NuqsTestingAdapter>
  );
  return { queryClient, wrapper };
}

beforeEach(() => {
  vi.clearAllMocks();
  get.mockResolvedValue({ data: { data: { items: [], pagination: { total: 0 } } } });
});

describe('useLeadsList', () => {
  it('requests event-scoped leads with default paging and sort', async () => {
    const view = setup();
    renderHook(() => useLeadsList(), { wrapper: view.wrapper });
    await waitFor(() => expect(get).toHaveBeenCalledWith('tf/leads', { params: {
      eventId: 'event-1', page: 1, limit: 5, sort: 'updatedAt:desc',
    } }));
  });

  it('maps keyword and status URL state to the backend query contract', async () => {
    const view = setup('?eventId=event-1&keyword=Ada&status=QUALIFIED&sort=createdAt%3Aasc&page=2&limit=10');
    renderHook(() => useLeadsList(), { wrapper: view.wrapper });
    await waitFor(() => expect(get).toHaveBeenCalledWith('tf/leads', { params: {
      eventId: 'event-1', page: 2, limit: 10, sort: 'createdAt:asc',
      search: 'Ada', filter: 'status:QUALIFIED',
    } }));
  });

  it('does not request leads without an eventId', async () => {
    const view = setup('');
    const { result } = renderHook(() => useLeadsList(), { wrapper: view.wrapper });
    await waitFor(() => expect(result.current.leads).toEqual([]));
    expect(get).not.toHaveBeenCalled();
  });

  it('normalises a non-array items response and keeps the server total', async () => {
    get.mockResolvedValue({ data: { data: { items: {}, pagination: { total: 9 } } } });
    const view = setup();
    const { result } = renderHook(() => useLeadsList(), { wrapper: view.wrapper });
    await waitFor(() => expect(result.current.totalCount).toBe(9));
    expect(result.current.leads).toEqual([]);
  });

  it('resets page to one when a filter changes', async () => {
    const view = setup('?eventId=event-1&page=4');
    const { result } = renderHook(() => useLeadsList(), { wrapper: view.wrapper });
    expect(result.current.page).toBe(4);
    await act(async () => { await result.current.setFilters({ status: 'QUALIFIED' }); });
    await waitFor(() => expect(result.current.page).toBe(1));
  });
});
