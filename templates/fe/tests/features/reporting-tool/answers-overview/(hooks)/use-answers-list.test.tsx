import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAnswersList } from '@/features/reporting-tool/answers-overview/(hooks)/use-answers-list';

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

describe('useAnswersList', () => {
  it('requests event-scoped answers with default paging and sort', async () => {
    const view = setup();
    renderHook(() => useAnswersList(), { wrapper: view.wrapper });
    await waitFor(() => expect(get).toHaveBeenCalledWith('tf/answers', { params: {
      eventId: 'event-1', page: 1, limit: 5, sort: 'updatedAt:desc',
    } }));
  });

  it('maps keyword and status URL state to the backend query contract', async () => {
    const view = setup('?eventId=event-1&keyword=Ada&status=COMPLETED&sort=createdAt%3Aasc&page=2&limit=10');
    renderHook(() => useAnswersList(), { wrapper: view.wrapper });
    await waitFor(() => expect(get).toHaveBeenCalledWith('tf/answers', { params: {
      eventId: 'event-1', page: 2, limit: 10, sort: 'createdAt:asc',
      search: 'Ada', filter: 'status:COMPLETED',
    } }));
  });

  it('does not request answers without an eventId', async () => {
    const view = setup('');
    const { result } = renderHook(() => useAnswersList(), { wrapper: view.wrapper });
    await waitFor(() => expect(result.current.answers).toEqual([]));
    expect(get).not.toHaveBeenCalled();
  });

  it('normalises a non-array items response and keeps the server total', async () => {
    get.mockResolvedValue({ data: { data: { items: {}, pagination: { total: 7 } } } });
    const view = setup();
    const { result } = renderHook(() => useAnswersList(), { wrapper: view.wrapper });
    await waitFor(() => expect(result.current.totalCount).toBe(7));
    expect(result.current.answers).toEqual([]);
  });

  it('resets page to one when a filter changes', async () => {
    const view = setup('?eventId=event-1&page=3');
    const { result } = renderHook(() => useAnswersList(), { wrapper: view.wrapper });
    expect(result.current.page).toBe(3);
    await act(async () => { await result.current.setFilters({ keyword: 'new' }); });
    await waitFor(() => expect(result.current.page).toBe(1));
  });
});
