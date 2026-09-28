import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiProxy } from '@/lib/api';
import { eventTaskKeys } from '@/features/events/event-detail/common/(hooks)/use-event-tasks';
import { useCreateEventTask } from '@/features/events/event-detail/common/(hooks)/use-create-event-task';
import { useDeleteEventTask } from '@/features/events/event-detail/common/(hooks)/use-delete-event-task';

vi.mock('@/lib/api', () => ({
  apiProxy: {
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, invalidate, wrapper };
}

describe('event task mutation hooks', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates a task and invalidates every task list for its event', async () => {
    vi.mocked(apiProxy.post).mockResolvedValue({ data: { data: { id: 'task-1' } } });
    const { invalidate, wrapper } = setup();
    const { result } = renderHook(() => useCreateEventTask(), { wrapper });

    await act(() => result.current.mutateAsync({
      eventId: 'event-1',
      service: 'AUFBAU',
      comment: 'Ready',
    }));

    expect(apiProxy.post).toHaveBeenCalledWith('etr/event-tasks', {
      eventId: 'event-1',
      service: 'AUFBAU',
      comment: 'Ready',
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: eventTaskKeys.byEvent('event-1') });
  });

  it('deletes a task and invalidates every task list for its event', async () => {
    vi.mocked(apiProxy.delete).mockResolvedValue({});
    const { invalidate, wrapper } = setup();
    const { result } = renderHook(() => useDeleteEventTask(), { wrapper });

    await act(() => result.current.mutateAsync({ eventId: 'event-1', taskId: 'task-1' }));

    expect(apiProxy.delete).toHaveBeenCalledWith('etr/event-tasks/task-1');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: eventTaskKeys.byEvent('event-1') });
  });
});
