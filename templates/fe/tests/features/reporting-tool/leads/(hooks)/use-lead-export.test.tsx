import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useLeadExport } from '@/features/reporting-tool/leads/(hooks)/use-lead-export';

const { get, success } = vi.hoisted(() => ({ get: vi.fn(), success: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiProxy: { get } }));
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('sonner', () => ({ toast: { success } }));
vi.mock('@/shared/stores/use-user-store', () => ({ useDateFormat: () => 'YYYY/MM/DD' }));

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
    data: new Blob(['leads']),
    headers: { 'content-disposition': 'attachment; filename="leads.xlsx"' },
  });
});

afterEach(() => vi.useRealTimers());

describe('useLeadExport', () => {
  it('stays disabled until the user explicitly exports', async () => {
    const view = setup('?eventId=event-1');
    const { result } = renderHook(() => useLeadExport(), { wrapper: view.wrapper });
    expect(get).not.toHaveBeenCalled();
    await act(async () => { await result.current.exportLeads(); });
    expect(get).toHaveBeenCalledTimes(1);
  });

  it('sends event, keyword, sort, and status:eq filter from URL state', async () => {
    const view = setup('?eventId=event-1&keyword=Ada&status=QUALIFIED&sort=createdAt%3Aasc');
    const { result } = renderHook(() => useLeadExport(), { wrapper: view.wrapper });
    await act(async () => { await result.current.exportLeads(); });
    expect(get).toHaveBeenCalledWith('tf/leads/export', {
      params: {
        eventId: 'event-1', search: 'Ada', sort: 'createdAt:asc', filter: 'status:eq:QUALIFIED',
      },
      responseType: 'blob',
    });
  });

  it('omits empty optional keyword and status filters', async () => {
    const view = setup('?eventId=event-1');
    const { result } = renderHook(() => useLeadExport(), { wrapper: view.wrapper });
    await act(async () => { await result.current.exportLeads(); });
    expect(get).toHaveBeenCalledWith('tf/leads/export', {
      params: { eventId: 'event-1', sort: 'updatedAt:desc' },
      responseType: 'blob',
    });
  });

  it('creates the expected dated lead-export filename', async () => {
    const downloads: string[] = [];
    vi.mocked(HTMLAnchorElement.prototype.click).mockImplementation(function capture(
      this: HTMLAnchorElement,
    ) {
      downloads.push(this.download);
    });
    const view = setup('?eventId=event-1');
    const { result } = renderHook(() => useLeadExport(), { wrapper: view.wrapper });
    await act(async () => { await result.current.exportLeads(); });
    expect(downloads).toEqual(['export_leads_2026-07-31.xlsx']);
    expect(success).toHaveBeenCalledWith('exportSuccess');
  });

  it('does not call the export endpoint without an eventId', async () => {
    const view = setup('');
    const { result } = renderHook(() => useLeadExport(), { wrapper: view.wrapper });
    await act(async () => { await result.current.exportLeads(); });
    expect(get).not.toHaveBeenCalled();
  });
});
