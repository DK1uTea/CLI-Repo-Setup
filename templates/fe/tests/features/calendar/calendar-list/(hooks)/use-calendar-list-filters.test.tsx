import { renderHook, act } from '@testing-library/react';
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { vi } from 'vitest';

import { useCalendarListFilters } from '@/features/calendar/calendar-list/(hooks)/use-calendar-list-filters';
import type { EventFilterConfigResponse } from '@/features/events/event-list/(hooks)/use-event-filter-config';

const { useEventFilterConfigMock } = vi.hoisted(() => ({
  useEventFilterConfigMock: vi.fn(
    (): { data: EventFilterConfigResponse | undefined; isLoading: boolean } => ({
      data: undefined,
      isLoading: false,
    }),
  ),
}));

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('@/features/events/event-list/(hooks)/use-event-filter-config', () => ({
  useEventFilterConfig: useEventFilterConfigMock,
}));

describe('useCalendarListFilters defaults (matches the events variant)', () => {
  beforeEach(() => {
    useEventFilterConfigMock.mockReturnValue({ data: undefined, isLoading: false });
  });

  // Sheet #15 ("Default = All → chỉ hiển thị Active") contradicts the
  // implementation below and `src/features/calendar/CONTEXT.md`, which is
  // explicit that `status` defaults to no filter (All), not Active — verified
  // directly against `use-calendar-list-filters.ts` (`status: parseAsString`
  // with no `.withDefault(...)`, and `statusOptions[0]` is a synthetic "all"
  // entry). Asserting the sheet's claim would make this test lie about real
  // behavior, so it asserts the real default instead — same pattern as the
  // dashboard module's precedent for a sheet-vs-implementation conflict.
  it('defaults status to All (no status filter)', () => {
    const { result } = renderHook(() => useCalendarListFilters(), {
      wrapper: withNuqsTestingAdapter(),
    });

    expect(result.current.filters.status).toBeNull();
  });

  it('defaults timeFrame to Upcoming', () => {
    const { result } = renderHook(() => useCalendarListFilters(), {
      wrapper: withNuqsTestingAdapter(),
    });

    expect(result.current.filters.timeFrame).toBe('UPCOMING');
  });

  it('defaults onlyMine (My Events) to true', () => {
    const { result } = renderHook(() => useCalendarListFilters(), {
      wrapper: withNuqsTestingAdapter(),
    });

    expect(result.current.isOnlyMine).toBe(true);
    expect(result.current.filters.onlyMine).toBe(true);
  });

  it('toggling My Events off then back on flips it and returns to the default', () => {
    const { result } = renderHook(() => useCalendarListFilters(), {
      wrapper: withNuqsTestingAdapter(),
    });

    act(() => result.current.toggleOnlyMine());
    expect(result.current.isOnlyMine).toBe(false);

    act(() => result.current.toggleOnlyMine());
    expect(result.current.isOnlyMine).toBe(true);
  });

  it('respects an explicit status/timeFrame/onlyMine already in the URL', () => {
    const { result } = renderHook(() => useCalendarListFilters(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '?status=DRAFT&timeFrame=PAST&onlyMine=false' }),
    });

    expect(result.current.filters.status).toBe('DRAFT');
    expect(result.current.filters.timeFrame).toBe('PAST');
    expect(result.current.isOnlyMine).toBe(false);
  });

  it('exposes a userId filter for the Event Manager dropdown', () => {
    const { result } = renderHook(() => useCalendarListFilters(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '?userId=user-1' }),
    });

    expect(result.current.filters.userId).toBe('user-1');
  });
});

describe('useCalendarListFilters options (from the shared events filter-config API)', () => {
  it('builds status/timeFrame/eventType options from GET /etr/events/filter-config, not hardcoded lists', () => {
    useEventFilterConfigMock.mockReturnValue({
      data: {
        status: [{ value: 'ACTIVE', label: 'Active (api)' }],
        timeFrame: [{ value: 'UPCOMING', label: 'Upcoming (api)' }],
        eventTypeId: [{ value: 'type-1', label: 'Conference' }],
        partnershipTypes: [{ value: 'EXHIBITION', label: 'Exhibition (api)' }],
        targetAudience: [{ value: 'CONSUMER', label: 'Consumer (api)' }],
        createdBy: [],
      },
      isLoading: false,
    });

    const { result } = renderHook(() => useCalendarListFilters(), {
      wrapper: withNuqsTestingAdapter(),
    });

    expect(result.current.statusOptions).toEqual([
      { value: 'all', label: 'statusAll' },
      { value: 'ACTIVE', label: 'Active (api)' },
    ]);
    expect(result.current.timeFrameOptions).toEqual([
      { value: 'UPCOMING', label: 'Upcoming (api)' },
      { value: 'all', label: 'timeFrameAll' },
    ]);
    expect(result.current.eventTypeOptions).toEqual([
      { value: 'all', label: 'eventTypeAll' },
      { value: 'type-1', label: 'Conference' },
    ]);
    expect(result.current.partnershipTypesOptions).toEqual([
      { value: 'EXHIBITION', label: 'Exhibition (api)' },
    ]);
    expect(result.current.targetAudienceOptions).toEqual([
      { value: 'CONSUMER', label: 'Consumer (api)' },
    ]);
    expect(result.current.managerOptions).toEqual([]);
  });

  it('does not add a duplicate All option when the API timeFrame enum already includes ALL', () => {
    useEventFilterConfigMock.mockReturnValue({
      data: {
        status: [],
        timeFrame: [
          { value: 'UPCOMING', label: 'Upcoming' },
          { value: 'ALL', label: 'All' },
        ],
        eventTypeId: [],
        partnershipTypes: [],
        targetAudience: [],
        createdBy: [],
      },
      isLoading: false,
    });

    const { result } = renderHook(() => useCalendarListFilters(), {
      wrapper: withNuqsTestingAdapter(),
    });

    expect(result.current.timeFrameOptions).toEqual([
      { value: 'UPCOMING', label: 'Upcoming' },
      { value: 'ALL', label: 'All' },
    ]);
  });

  it('exposes createdBy as managerOptions, same field the events variant uses for its Event Manager filter', () => {
    useEventFilterConfigMock.mockReturnValue({
      data: {
        status: [],
        timeFrame: [],
        eventTypeId: [],
        partnershipTypes: [],
        targetAudience: [],
        createdBy: [{ value: 'user-1', label: 'Max Mustermann' }],
      },
      isLoading: false,
    });

    const { result } = renderHook(() => useCalendarListFilters(), {
      wrapper: withNuqsTestingAdapter(),
    });

    expect(result.current.managerOptions).toEqual([{ value: 'user-1', label: 'Max Mustermann' }]);
  });

  it('degrades to empty option lists while the config is still loading', () => {
    useEventFilterConfigMock.mockReturnValue({ data: undefined, isLoading: true });

    const { result } = renderHook(() => useCalendarListFilters(), {
      wrapper: withNuqsTestingAdapter(),
    });

    expect(result.current.statusOptions).toEqual([{ value: 'all', label: 'statusAll' }]);
    expect(result.current.eventTypeOptions).toEqual([{ value: 'all', label: 'eventTypeAll' }]);
    expect(result.current.partnershipTypesOptions).toEqual([]);
    expect(result.current.targetAudienceOptions).toEqual([]);
    expect(result.current.managerOptions).toEqual([]);
    expect(result.current.isLoadingConfig).toBe(true);
  });

  it('exposes per-page options as bare counts plus a clear action', () => {
    const { result } = renderHook(() => useCalendarListFilters(), {
      wrapper: withNuqsTestingAdapter(),
    });

    expect(result.current.takeOptions).toEqual([
      { value: '10', label: '10' },
      { value: '20', label: '20' },
      { value: '50', label: '50' },
      { value: '100', label: '100' },
      { value: 'all', label: 'takeDefault' },
    ]);
  });
});
