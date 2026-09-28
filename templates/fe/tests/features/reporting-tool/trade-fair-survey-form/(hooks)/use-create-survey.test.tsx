import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TradeFairEvent } from '@/features/reporting-tool/(helpers)/trade-fair-event-type';
import type { TradeFairSurveyFormDto } from '@/features/reporting-tool/trade-fair-survey-form/(helpers)/trade-fair-survey-form-schema';
import { useCreateSurvey } from '@/features/reporting-tool/trade-fair-survey-form/(hooks)/use-create-survey';

const { addSurveyToEvent, post, warning } = vi.hoisted(() => ({
  addSurveyToEvent: vi.fn(), post: vi.fn(), warning: vi.fn(),
}));

vi.mock('@/lib/api', () => ({ apiProxy: { post } }));
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('sonner', () => ({ toast: { warning } }));
vi.mock('@/features/reporting-tool/(hooks)/(survey-hooks)/use-add-survey-to-event', () => ({
  useAddSurveyToEvent: () => ({ addSurveyToEvent, isAdding: false }),
}));

const survey: TradeFairSurveyFormDto = { name: 'New survey', steps: [] };

function setup(searchParams = '?eventId=event-1') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <NuqsTestingAdapter searchParams={searchParams}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </NuqsTestingAdapter>
  );
  return { queryClient, invalidate, wrapper };
}

beforeEach(() => {
  vi.clearAllMocks();
  post.mockResolvedValue({ data: { data: { id: 'survey-new' } } });
  addSurveyToEvent.mockResolvedValue(undefined);
});

describe('useCreateSurvey', () => {
  it('creates the survey then assigns the complete desired survey list to the current event', async () => {
    const view = setup();
    view.queryClient.setQueryData<Partial<TradeFairEvent>>(['trade-fair-event-detail', 'event-1'], {
      surveys: [{ id: 'survey-existing', requiredLogin: false } as never],
    });
    const { result } = renderHook(() => useCreateSurvey(), { wrapper: view.wrapper });
    await act(async () => { await expect(result.current.mutateAsync(survey)).resolves.toEqual({ id: 'survey-new' }); });
    expect(post).toHaveBeenCalledWith('tf/surveys', survey);
    expect(addSurveyToEvent).toHaveBeenCalledWith({ surveys: [
      { surveyId: 'survey-existing', requiredLogin: false },
      { surveyId: 'survey-new', requiredLogin: true },
    ] });
  });

  it('keeps creation successful and warns when event assignment fails', async () => {
    addSurveyToEvent.mockRejectedValue(new Error('assignment failed'));
    const view = setup();
    const { result } = renderHook(() => useCreateSurvey(), { wrapper: view.wrapper });
    await act(async () => { await expect(result.current.mutateAsync(survey)).resolves.toEqual({ id: 'survey-new' }); });
    expect(warning).toHaveBeenCalledWith('linkSurveyToEventError');
  });

  it('does not assign when no eventId exists', async () => {
    const view = setup('');
    const { result } = renderHook(() => useCreateSurvey(), { wrapper: view.wrapper });
    await act(async () => { await result.current.mutateAsync(survey); });
    expect(addSurveyToEvent).not.toHaveBeenCalled();
  });

  it('invalidates the survey library after create succeeds', async () => {
    const view = setup('');
    const { result } = renderHook(() => useCreateSurvey(), { wrapper: view.wrapper });
    await act(async () => { await result.current.mutateAsync(survey); });
    await waitFor(() => expect(view.invalidate).toHaveBeenCalledWith({ queryKey: ['trade-fair-survey-list'] }));
  });
});
