import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSurveyRequiredLogin } from '@/features/reporting-tool/(hooks)/(survey-hooks)/use-survey-required-login';

const { patch } = vi.hoisted(() => ({ patch: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiProxy: { patch } }));

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
  patch.mockResolvedValue({ data: { data: { requiredLogin: false } } });
});

describe('useSurveyRequiredLogin', () => {
  it('PATCHes the no-login toggle for the given event-survey', async () => {
    const view = setup();
    const { result } = renderHook(() => useSurveyRequiredLogin('event-survey-1'), {
      wrapper: view.wrapper,
    });
    await act(async () => { await result.current.updateRequiredLogin({ requiredLogin: false }); });
    expect(patch).toHaveBeenCalledWith('tf/event-surveys/event-survey-1/required-login', {
      requiredLogin: false,
    });
  });

  it('invalidates both the survey list and the event detail after a successful toggle', async () => {
    const view = setup();
    const { result } = renderHook(() => useSurveyRequiredLogin('event-survey-1'), {
      wrapper: view.wrapper,
    });
    await act(async () => { await result.current.updateRequiredLogin({ requiredLogin: true }); });
    await waitFor(() => {
      expect(view.invalidate).toHaveBeenCalledWith({ queryKey: ['trade-fair-survey-list'] });
      expect(view.invalidate).toHaveBeenCalledWith({ queryKey: ['trade-fair-event-detail'] });
    });
  });

  it('does not invalidate either query when the toggle fails', async () => {
    patch.mockRejectedValue(new Error('backend error'));
    const view = setup();
    const { result } = renderHook(() => useSurveyRequiredLogin('event-survey-1'), {
      wrapper: view.wrapper,
    });
    await act(async () => {
      await expect(result.current.updateRequiredLogin({ requiredLogin: true })).rejects.toThrow();
    });
    expect(view.invalidate).not.toHaveBeenCalled();
  });
});
