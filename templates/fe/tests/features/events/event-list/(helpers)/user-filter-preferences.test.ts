import { describe, expect, it } from 'vitest';

import {
  eventListUrlHasExplicitFilters,
  calendarListUrlToSaved,
  eventCalendarUrlToSaved,
  eventListUrlToSaved,
  normalizeSavedFilters,
  savedToCalendarListUrl,
  savedToEventCalendarUrl,
  savedToEventListUrl,
} from '@/features/events/event-list/(helpers)/user-filter-preferences';

describe('normalizeSavedFilters', () => {
  it('treats a missing or {} list as an empty array', () => {
    expect(normalizeSavedFilters({
      timeFrame: 'PAST',
      partnershipTypes: {},
      targetAudience: 'A,B',
    })).toEqual({
      timeFrame: 'PAST',
      partnershipTypes: [],
      targetAudience: ['A', 'B'],
    });
  });
});

describe('event list filter mapping', () => {
  it('does not treat default upcoming + my-event as an explicit URL filter', () => {
    expect(eventListUrlHasExplicitFilters({
      timeFrame: 'UPCOMING',
      my_event: 'true',
    })).toBe(false);
  });

  it('round-trips saved preferences into URL filter state', () => {
    const saved = eventListUrlToSaved({
      status: 'draft',
      event_type: 'type-1',
      timeFrame: 'PAST',
      my_event: 'false',
      partnershipTypes: 'PRODUCT_PARTNER,EXHIBITION',
    });

    expect(savedToEventListUrl(saved)).toMatchObject({
      status: 'draft',
      event_type: 'type-1',
      timeFrame: 'PAST',
      my_event: 'false',
      partnershipTypes: 'PRODUCT_PARTNER,EXHIBITION',
    });
  });
});

describe('calendar list filter mapping', () => {
  it('round-trips calendar navigator filters into saved preferences', () => {
    const saved = calendarListUrlToSaved({
      status: 'DRAFT',
      eventTypeId: 'type-1',
      timeFrame: 'PAST',
      onlyMine: false,
      partnershipTypes: ['PRODUCT_PARTNER'],
    });

    expect(savedToCalendarListUrl(saved)).toMatchObject({
      status: 'DRAFT',
      eventTypeId: 'type-1',
      timeFrame: 'PAST',
      onlyMine: false,
      partnershipTypes: ['PRODUCT_PARTNER'],
    });
  });
});

describe('events calendar tab filter mapping', () => {
  it('persists the selected view (e.g. day) alongside the other filters', () => {
    const saved = eventCalendarUrlToSaved(
      {
        timeFrame: 'UPCOMING',
        my_event: 'true',
        start_date: '2026-09-09T00:00:00Z',
        end_date: '2026-09-10T00:00:00Z',
      },
      'day',
    );

    expect(saved.view).toBe('day');
  });

  it('does not persist a stale startDate/endDate snapshot, only the view', () => {
    const saved = eventCalendarUrlToSaved(
      {
        timeFrame: 'UPCOMING',
        my_event: 'true',
        start_date: '2026-09-09T00:00:00Z',
        end_date: '2026-09-10T00:00:00Z',
      },
      'day',
    );

    expect(saved.startDate).toBeUndefined();
    expect(saved.endDate).toBeUndefined();
  });

  it('restores the saved view into calendar URL state on load', () => {
    const restored = savedToEventCalendarUrl({
      timeFrame: 'UPCOMING',
      onlyMine: true,
      view: 'day',
    });

    expect(restored.view).toBe('day');
    expect(restored.filters.start_date).toBeNull();
    expect(restored.filters.end_date).toBeNull();
  });

  it('defaults to month view when no view was saved', () => {
    const restored = savedToEventCalendarUrl({ timeFrame: 'UPCOMING', onlyMine: true });

    expect(restored.view).toBe('month');
  });
});
