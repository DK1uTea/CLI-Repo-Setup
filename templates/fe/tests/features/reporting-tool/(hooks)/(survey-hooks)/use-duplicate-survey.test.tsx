import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useDuplicateSurvey } from '@/features/reporting-tool/(hooks)/(survey-hooks)/use-duplicate-survey';

const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiProxy: { post } }));

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
  post.mockResolvedValue({ data: { data: { id: 'survey-copy' } } });
});

describe('useDuplicateSurvey', () => {
  it('POSTs the duplicate request with the given name for the source survey', async () => {
    const view = setup();
    const { result } = renderHook(() => useDuplicateSurvey('survey-1'), { wrapper: view.wrapper });
    await act(async () => {
      await expect(result.current.duplicateSurvey({ name: 'Survey (Copy)' })).resolves.toEqual({
        id: 'survey-copy',
      });
    });
    expect(post).toHaveBeenCalledWith('tf/surveys/survey-1/duplicate', { name: 'Survey (Copy)' });
  });

  it('invalidates the survey library after a successful duplicate', async () => {
    const view = setup();
    const { result } = renderHook(() => useDuplicateSurvey('survey-1'), { wrapper: view.wrapper });
    await act(async () => { await result.current.duplicateSurvey({ name: 'Survey (Copy)' }); });
    await waitFor(() =>
      expect(view.invalidate).toHaveBeenCalledWith({ queryKey: ['trade-fair-survey-list'] }),
    );
  });

  it('does not invalidate the survey library when duplication fails', async () => {
    post.mockRejectedValue(new Error('backend error'));
    const view = setup();
    const { result } = renderHook(() => useDuplicateSurvey('survey-1'), { wrapper: view.wrapper });
    await act(async () => {
      await expect(result.current.duplicateSurvey({ name: 'Survey (Copy)' })).rejects.toThrow();
    });
    expect(view.invalidate).not.toHaveBeenCalledWith({ queryKey: ['trade-fair-survey-list'] });
  });
});
