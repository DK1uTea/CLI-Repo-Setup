import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiProxy } from '@/lib/api';
import { eventCommentKeys } from '@/features/events/event-detail/common/(hooks)/use-event-comments';
import { useSendEventComment } from '@/features/events/event-detail/common/(hooks)/use-send-event-comment';
import { useTransferEventOwnership } from '@/features/events/event-detail/common/(hooks)/use-transfer-event-ownership';

vi.mock('@/lib/api', () => ({ apiProxy: { post: vi.fn(), patch: vi.fn() } }));

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { invalidate, wrapper };
}

describe('event common mutation hooks', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sends a comment and invalidates comments for its event', async () => {
    vi.mocked(apiProxy.post).mockResolvedValue({ data: { data: { id: 'comment-1' } } });
    const { invalidate, wrapper } = setup();
    const { result } = renderHook(() => useSendEventComment(), { wrapper });

    await act(() => result.current.mutateAsync({
      eventId: 'event-1', content: 'Reply', parentId: 'root-1',
    }));

    expect(apiProxy.post).toHaveBeenCalledWith('etr/events/event-1/comments', {
      content: 'Reply', parentId: 'root-1',
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: eventCommentKeys.byEvent('event-1') });
  });

  it('transfers ownership and invalidates event and calendar detail caches', async () => {
    vi.mocked(apiProxy.patch).mockResolvedValue({});
    const { invalidate, wrapper } = setup();
    const { result } = renderHook(() => useTransferEventOwnership(), { wrapper });

    await act(() => result.current.mutateAsync({ eventId: 'event-1', userId: 'user-2' }));

    expect(apiProxy.patch).toHaveBeenCalledWith('etr/events/transfer-ownership', {
      eventId: 'event-1', userId: 'user-2',
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['event-detail', 'event-1'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['calendar-event-detail', 'event-1'] });
  });
});
