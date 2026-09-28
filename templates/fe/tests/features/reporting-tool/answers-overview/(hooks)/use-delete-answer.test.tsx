import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useDeleteAnswer } from '@/features/reporting-tool/answers-overview/(hooks)/use-delete-answer';

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

describe('useDeleteAnswer', () => {
  it('sends DELETE for the given answer id', async () => {
    const view = setup();
    const { result } = renderHook(() => useDeleteAnswer('answer-1'), { wrapper: view.wrapper });
    await act(async () => { await result.current.deleteAnswer(); });
    expect(del).toHaveBeenCalledWith('tf/answers/answer-1');
  });

  it('invalidates the answers list after a successful delete', async () => {
    const view = setup();
    const { result } = renderHook(() => useDeleteAnswer('answer-1'), { wrapper: view.wrapper });
    await act(async () => { await result.current.deleteAnswer(); });
    await waitFor(() =>
      expect(view.invalidate).toHaveBeenCalledWith({ queryKey: ['trade-fair-answers-list'] }),
    );
  });

  it('does not invalidate the answers list when the delete fails', async () => {
    del.mockRejectedValue(new Error('backend error'));
    const view = setup();
    const { result } = renderHook(() => useDeleteAnswer('answer-1'), { wrapper: view.wrapper });
    await act(async () => { await expect(result.current.deleteAnswer()).rejects.toThrow(); });
    expect(view.invalidate).not.toHaveBeenCalledWith({ queryKey: ['trade-fair-answers-list'] });
  });
});
