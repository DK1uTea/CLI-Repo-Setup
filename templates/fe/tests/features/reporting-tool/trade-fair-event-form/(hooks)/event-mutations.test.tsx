import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TradeFairEventFormDto } from '@/features/reporting-tool/trade-fair-event-form/(helpers)/trade-fair-event-form-schema';
import { useCreateEvent } from '@/features/reporting-tool/trade-fair-event-form/(hooks)/use-create-event';
import { useUpdateEvent } from '@/features/reporting-tool/trade-fair-event-form/(hooks)/use-update-event';

const { post, put } = vi.hoisted(() => ({ post: vi.fn(), put: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiProxy: { post, put } }));

const form: TradeFairEventFormDto = {
  eventId: 'EVENT-1001', title: 'Berlin Fair', eventMode: 'FACE_TO_FACE',
  targetAudience: ['Retail'], eventType: 'FAIR', description: 'Description',
  participation: 'Exhibitor', images: [{ name: 'fair.png', size: 10, preview: 'blob:fair' }],
  startDate: '2026-08-01', startTime: '09:00', endDate: '2026-08-01', endTime: '17:00',
  eventLocation: '', address: 'Messe Berlin', street: 'Messedamm 22', zipCode: '14055',
  city: 'Berlin', isSaveLocation: false,
  surveys: [{ surveyId: 'survey-1', requiredLogin: true }],
};

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
  post.mockResolvedValue({ data: { data: { id: 'event-created' } } });
  put.mockResolvedValue({ data: { data: { id: 'event-1' } } });
});

describe('useCreateEvent', () => {
  it.each(['DRAFT', 'PUBLISHED'] as const)('POSTs the mapped event with %s status', async (status) => {
    const view = setup();
    const { result } = renderHook(() => useCreateEvent(), { wrapper: view.wrapper });
    await act(async () => {
      await expect(result.current.mutateAsync({ data: form, status })).resolves.toEqual({ id: 'event-created' });
    });
    expect(post).toHaveBeenCalledWith('tf/events', expect.objectContaining({
      status, name: 'Berlin Fair', eventCode: 'EVENT-1001',
      startDate: '2026-08-01T09:00:00.000Z', endDate: '2026-08-01T17:00:00.000Z',
    }));
  });

  it('invalidates the event list after create succeeds', async () => {
    const view = setup();
    const { result } = renderHook(() => useCreateEvent(), { wrapper: view.wrapper });
    await act(async () => { await result.current.mutateAsync({ data: form, status: 'DRAFT' }); });
    await waitFor(() => expect(view.invalidate).toHaveBeenCalledWith({ queryKey: ['trade-fair-event-list'] }));
  });
});

describe('useUpdateEvent', () => {
  it('PUTs the mapped event without status when no status is supplied', async () => {
    const view = setup();
    const { result } = renderHook(() => useUpdateEvent('event-1'), { wrapper: view.wrapper });
    await act(async () => { await result.current.mutateAsync({ data: form }); });
    expect(put).toHaveBeenCalledWith('tf/events/event-1', expect.not.objectContaining({ status: expect.anything() }));
  });

  it('includes an explicit status in an event update', async () => {
    const view = setup();
    const { result } = renderHook(() => useUpdateEvent('event-1'), { wrapper: view.wrapper });
    await act(async () => { await result.current.mutateAsync({ data: form, status: 'PUBLISHED' }); });
    expect(put).toHaveBeenCalledWith('tf/events/event-1', expect.objectContaining({ status: 'PUBLISHED' }));
  });

  it('invalidates event detail and list after update succeeds', async () => {
    const view = setup();
    const { result } = renderHook(() => useUpdateEvent('event-1'), { wrapper: view.wrapper });
    await act(async () => { await result.current.mutateAsync({ data: form }); });
    await waitFor(() => {
      expect(view.invalidate).toHaveBeenCalledWith({ queryKey: ['trade-fair-event-detail', 'event-1'] });
      expect(view.invalidate).toHaveBeenCalledWith({ queryKey: ['trade-fair-event-list'] });
    });
  });
});
