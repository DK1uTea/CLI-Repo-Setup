import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAnswerExport } from '@/features/reporting-tool/answers-overview/(hooks)/use-answer-export';

const { get, success } = vi.hoisted(() => ({ get: vi.fn(), success: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiProxy: { get } }));
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('sonner', () => ({ toast: { success } }));
vi.mock('@/shared/stores/use-user-store', () => ({ useDateFormat: () => 'DD/MM/YYYY' }));

function setup(searchParams: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <NuqsTestingAdapter searchParams={searchParams}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </NuqsTestingAdapter>
  );
  return { queryClient, wrapper };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-07-31T08:00:00.000Z'));
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:export') });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
  get.mockResolvedValue({
    status: 200,
    data: new Blob(['answers']),
    headers: { 'content-disposition': 'attachment; filename="answers.csv"' },
  });
});

afterEach(() => vi.useRealTimers());

describe('useAnswerExport', () => {
  it('stays disabled until the user explicitly exports', async () => {
    const view = setup('?eventId=event-1');
    const { result } = renderHook(() => useAnswerExport(), { wrapper: view.wrapper });
    expect(get).not.toHaveBeenCalled();
    await act(async () => { await result.current.exportAnswers(); });
    expect(get).toHaveBeenCalledTimes(1);
  });

  it('sends only eventId and optional selected ids, ignoring list filters', async () => {
    const view = setup('?eventId=event-1&id=answer-1&keyword=Ada&status=COMPLETED&sort=createdAt%3Aasc');
    const { result } = renderHook(() => useAnswerExport(), { wrapper: view.wrapper });
    await act(async () => { await result.current.exportAnswers(); });
    expect(get).toHaveBeenCalledWith('tf/answers/export', {
      params: { eventId: 'event-1', ids: 'answer-1' },
      responseType: 'blob',
    });
  });

  it('uses an explicit event and id selection over URL values', async () => {
    const view = setup('?eventId=url-event&id=url-answer');
    const { result } = renderHook(
      () => useAnswerExport({ eventId: 'explicit-event', ids: 'a-1,a-2' }),
      { wrapper: view.wrapper },
    );
    await act(async () => { await result.current.exportAnswers(); });
    expect(get).toHaveBeenCalledWith('tf/answers/export', {
      params: { eventId: 'explicit-event', ids: 'a-1,a-2' },
      responseType: 'blob',
    });
  });

  it('uses the response extension and formatted date in the downloaded filename', async () => {
    const downloads: string[] = [];
    vi.mocked(HTMLAnchorElement.prototype.click).mockImplementation(function capture(
      this: HTMLAnchorElement,
    ) {
      downloads.push(this.download);
    });
    const view = setup('?eventId=event-1');
    const { result } = renderHook(() => useAnswerExport(), { wrapper: view.wrapper });
    await act(async () => { await result.current.exportAnswers(); });
    expect(downloads).toEqual(['export_reports_31-07-2026.csv']);
    expect(success).toHaveBeenCalledWith('exportSuccess');
  });

  it('does not call the export endpoint without an eventId', async () => {
    const view = setup('');
    const { result } = renderHook(() => useAnswerExport(), { wrapper: view.wrapper });
    await act(async () => { await result.current.exportAnswers(); });
    expect(get).not.toHaveBeenCalled();
  });
});
