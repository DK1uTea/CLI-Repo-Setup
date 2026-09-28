import { describe, expect, it, vi } from 'vitest';

import { apiProxy } from '@/lib/api';
import {
  fetchCalendarEvents,
  mergeCalendarEventGroups,
  type CalendarEventItem,
} from '@/features/calendar/calendar-list/(hooks)/use-calendar-list-data';

vi.mock('@/lib/api', () => ({ apiProxy: { get: vi.fn() } }));

const rawEvent: CalendarEventItem = {
  id: '0ddb1fe0-c483-4532-848f-482ddf12ae1c',
  title: 'Test',
  type: 'Dauerleihgabe',
  startDate: '2026-08-14T00:00:00.000Z',
  endDate: '2026-08-15T00:00:00.000Z',
  adminContact: { name: 'Bavaria Statue', email: 'ccep.phillip@prowerb.de' },
  status: 'ACTIVE',
  isOwner: true,
};

describe('fetchCalendarEvents', () => {
  it('passes through the already-grouped-by-month items from the backend response', async () => {
    (apiProxy.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          items: [{ month: '2026-08', total: 1, events: [rawEvent] }],
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false },
        },
      },
    });

    const result = await fetchCalendarEvents({}, 1);

    expect(result.groups).toEqual([{ month: '2026-08', total: 1, events: [rawEvent] }]);
    expect(result.pagination?.total).toBe(1);
  });

  it('normalizes a non-array items field to an empty group list', async () => {
    (apiProxy.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: { items: {}, pagination: undefined } },
    });

    const result = await fetchCalendarEvents({}, 1);

    expect(result.groups).toEqual([]);
  });

  it('maps userId onto the createdBy query param, same as the events variant', async () => {
    (apiProxy.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: { items: [], pagination: undefined } },
    });

    await fetchCalendarEvents({ userId: 'user-1' }, 1);

    const [, config] = (apiProxy.get as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(config.params.createdBy).toBe('user-1');
  });

  it('serializes array filters as repeated keys without brackets', async () => {
    (apiProxy.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: { items: [], pagination: undefined } },
    });

    await fetchCalendarEvents({
      partnershipTypes: ['PRODUCT_PARTNER'],
      productPartnerCategories: ['SOFTDRINKS'],
      targetAudience: ['CONSUMER'],
    }, 1);

    const [, config] = (apiProxy.get as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(config.params).toMatchObject({
      partnershipTypes: ['PRODUCT_PARTNER'],
      productPartnerCategories: ['SOFTDRINKS'],
      targetAudience: ['CONSUMER'],
    });
    expect(config.paramsSerializer).toEqual({ indexes: null });
  });

  it('omits createdBy when userId is "all" or unset', async () => {
    (apiProxy.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: { items: [], pagination: undefined } },
    });

    await fetchCalendarEvents({ userId: 'all' }, 1);

    const [, config] = (apiProxy.get as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(config.params.createdBy).toBeUndefined();
  });

  // Sheet #11: search matches by event name only, never by owner/category. The
  // BE endpoint itself decides what `search` matches against — the FE's only
  // testable contract is that it forwards the typed keyword as the single
  // `search` param and never derives/splits it into any owner- or
  // category-shaped filter of its own.
  it('forwards the keyword as the single "search" param, never as an owner/category filter', async () => {
    (apiProxy.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: { items: [], pagination: undefined } },
    });

    await fetchCalendarEvents({ search: 'Munich Launch' }, 1);

    const [, config] = (apiProxy.get as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(config.params.search).toBe('Munich Launch');
    expect(config.params.owner).toBeUndefined();
    expect(config.params.createdBy).toBeUndefined();
  });

  it('omits timeFrame when All is selected, same as the events variant', async () => {
    (apiProxy.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: { items: [], pagination: undefined } },
    });

    await fetchCalendarEvents({ timeFrame: 'all' }, 1);

    const [, config] = (apiProxy.get as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(config.params.timeFrame).toBeUndefined();
  });
});

describe('mergeCalendarEventGroups', () => {
  it('merges groups for the same month coming from different pages', () => {
    const merged = mergeCalendarEventGroups([
      { month: '2026-08', total: 1, events: [rawEvent] },
      { month: '2026-08', total: 1, events: [{ ...rawEvent, id: 'second' }] },
      { month: '2026-09', total: 1, events: [{ ...rawEvent, id: 'third' }] },
    ]);

    expect(merged).toHaveLength(2);
    expect(merged[0].month).toBe('2026-08');
    expect(merged[0].events).toHaveLength(2);
    expect(merged[1].month).toBe('2026-09');
    expect(merged[1].events).toHaveLength(1);
  });

  it('ignores invalid event arrays returned by the API', () => {
    const merged = mergeCalendarEventGroups([
      { month: '2026-08', total: 1, events: {} },
    ] as unknown as Parameters<typeof mergeCalendarEventGroups>[0]);

    expect(merged).toEqual([{ month: '2026-08', total: 0, events: [] }]);
  });
});
