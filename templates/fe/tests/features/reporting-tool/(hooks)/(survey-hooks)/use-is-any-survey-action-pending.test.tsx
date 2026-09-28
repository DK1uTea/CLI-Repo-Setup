import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { useIsAnySurveyActionPending } from '@/features/reporting-tool/(hooks)/(survey-hooks)/use-is-any-survey-action-pending';

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

describe('useIsAnySurveyActionPending', () => {
  it('is false when no survey-action mutation is running', () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useIsAnySurveyActionPending(), { wrapper });

    expect(result.current).toBe(false);
  });

  it('is true while any mutation tagged under the shared "survey-action" key is pending, from any card', async () => {
    const { wrapper } = setup();
    let resolveMutation: (() => void) | undefined;

    const { result } = renderHook(
      () => {
        const pending = useIsAnySurveyActionPending();
        const assign = useMutation({
          mutationKey: ['survey-action', 'assign-survey'],
          mutationFn: () => new Promise<void>((resolve) => { resolveMutation = resolve; }),
        });
        return { pending, assign };
      },
      { wrapper },
    );

    expect(result.current.pending).toBe(false);

    act(() => { result.current.assign.mutate(); });
    await waitFor(() => expect(result.current.pending).toBe(true));

    await act(async () => { resolveMutation?.(); });
    await waitFor(() => expect(result.current.pending).toBe(false));
  });

  it('ignores mutations that are not tagged under the shared "survey-action" key', () => {
    const { wrapper } = setup();

    const { result } = renderHook(
      () => {
        const pending = useIsAnySurveyActionPending();
        const unrelated = useMutation({
          mutationKey: ['some-other-feature'],
          mutationFn: () => new Promise<void>(() => {}),
        });
        return { pending, unrelated };
      },
      { wrapper },
    );

    act(() => { result.current.unrelated.mutate(); });

    expect(result.current.pending).toBe(false);
  });
});
