import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useDeleteEvent } from '@/features/reporting-tool/(hooks)/use-delete-event';

const { del } = vi.hoisted(() => ({ del: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiProxy: { delete: del } }));

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, invalidate, wrapper };
}

beforeEach(() => {
  vi.clearAllMocks();
  del.mockResolvedValue({ data: { status: 200 } });
});

describe('useDeleteEvent', () => {
  it('sends DELETE for the given event id', async () => {
    const view = setup();
    const { result } = renderHook(() => useDeleteEvent('event-1'), { wrapper: view.wrapper });
    await act(async () => { await result.current.deleteEvent(); });
    expect(del).toHaveBeenCalledWith('tf/events/event-1');
  });

  it('invalidates the event list after a successful delete', async () => {
    const view = setup();
    const { result } = renderHook(() => useDeleteEvent('event-1'), { wrapper: view.wrapper });
    await act(async () => { await result.current.deleteEvent(); });
    await waitFor(() =>
      expect(view.invalidate).toHaveBeenCalledWith({ queryKey: ['trade-fair-event-list'] }),
    );
  });

  it('does not invalidate the event list when the delete fails', async () => {
    del.mockRejectedValue(new Error('backend error'));
    const view = setup();
    const { result } = renderHook(() => useDeleteEvent('event-1'), { wrapper: view.wrapper });
    await act(async () => { await expect(result.current.deleteEvent()).rejects.toThrow(); });
    expect(view.invalidate).not.toHaveBeenCalledWith({ queryKey: ['trade-fair-event-list'] });
  });
});
