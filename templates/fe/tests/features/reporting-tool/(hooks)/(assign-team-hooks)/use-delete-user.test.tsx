import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useDeleteUser } from '@/features/reporting-tool/(hooks)/(assign-team-hooks)/use-delete-user';

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

describe('useDeleteUser', () => {
  it('sends DELETE for the given assignment id', async () => {
    const view = setup();
    const { result } = renderHook(() => useDeleteUser('event-survey-1'), { wrapper: view.wrapper });
    await act(async () => { await result.current.deleteUser('assignment-1'); });
    expect(del).toHaveBeenCalledWith('tf/users/remove-event-assignment/assignment-1');
  });

  it('invalidates the assigned-user list scoped to the event-survey after success', async () => {
    const view = setup();
    const { result } = renderHook(() => useDeleteUser('event-survey-1'), { wrapper: view.wrapper });
    await act(async () => { await result.current.deleteUser('assignment-1'); });
    await waitFor(() =>
      expect(view.invalidate).toHaveBeenCalledWith({
        queryKey: ['trade-fair-user-event-survey', 'event-survey-1'],
      }),
    );
  });

  it('also invalidates the event detail when an eventId is provided', async () => {
    const view = setup();
    const { result } = renderHook(() => useDeleteUser('event-survey-1', 'event-1'), {
      wrapper: view.wrapper,
    });
    await act(async () => { await result.current.deleteUser('assignment-1'); });
    await waitFor(() =>
      expect(view.invalidate).toHaveBeenCalledWith({
        queryKey: ['trade-fair-event-detail', 'event-1'],
      }),
    );
  });

  it('does not attempt to invalidate the event detail when no eventId is given', async () => {
    const view = setup();
    const { result } = renderHook(() => useDeleteUser('event-survey-1'), { wrapper: view.wrapper });
    await act(async () => { await result.current.deleteUser('assignment-1'); });
    await waitFor(() => expect(view.invalidate).toHaveBeenCalled());
    expect(view.invalidate).not.toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: expect.arrayContaining(['trade-fair-event-detail']) }),
    );
  });
});
