import { describe, expect, it } from 'vitest';
import { dayjs } from '@/lib/date-utils';

import {
  getDefaultDates,
  getEventDatesFromDeadline,
  getEventFormDetailStep,
  getLogisticsDateDefaults,
  isOverlapping,
  mapDetailToFormValues,
} from '@/features/events/event-form/(helpers)/event-form-helpers';
import {
  isDauerleihgabeEventType,
  isPermanentLoanEventType,
} from '@/features/events/event-form/(helpers)/event-form-constants';

describe('getEventDatesFromDeadline', () => {
  it('derives event, setup, and teardown defaults without a setup deadline', () => {
    expect(getEventDatesFromDeadline('2026-07-30')).toEqual({
      startDate: '2026-07-30',
      startTime: '00:00',
      endDate: '2026-07-31',
      endTime: '00:00',
      setupStartDate: '2026-07-29',
      setupStartTime: '00:00',
      setupEndDate: '2026-07-30',
      setupEndTime: '00:00',
      teardownStartDate: '2026-08-01',
      teardownStartTime: '00:00',
      teardownEndDate: '2026-08-02',
      teardownEndTime: '00:00',
    });
  });

  it('rejects an invalid deadline instead of creating a local fallback date', () => {
    expect(getEventDatesFromDeadline('not-a-date')).toBeNull();
  });
});

describe('getDefaultDates', () => {
  it('leaves event and setup dates empty until the backend deadline is available', () => {
    expect(getDefaultDates()).toMatchObject({
      startDate: '',
      endDate: '',
      setupStartDate: '',
      setupEndDate: '',
    });
  });
});

describe('getLogisticsDateDefaults', () => {
  it('sets Setup Start one day before Event Start without a deadline clamp', () => {
    expect(getLogisticsDateDefaults({
      eventStartDate: '2026-07-30',
      eventEndDate: '2026-07-31',
    })).toEqual({
      setupStartDate: '2026-07-29', setupStartTime: '00:00',
      setupEndDate: '2026-07-30', setupEndTime: '00:00',
      teardownStartDate: '2026-08-01', teardownStartTime: '00:00',
      teardownEndDate: '2026-08-02', teardownEndTime: '00:00',
    });
  });

  it('sets Setup Start one day before a later Event Start', () => {
    expect(getLogisticsDateDefaults({
      eventStartDate: '2026-08-05',
      eventEndDate: '2026-08-07',
    })).toMatchObject({
      setupStartDate: '2026-08-04',
      setupEndDate: '2026-08-05',
      teardownStartDate: '2026-08-08',
      teardownEndDate: '2026-08-09',
    });
  });
});

describe('isOverlapping', () => {
  const date = (value: string) => dayjs.utc(value).toDate();

  it('detects overlapping ranges', () => {
    expect(isOverlapping(
      date('2026-08-05T09:00:00Z'), date('2026-08-05T11:00:00Z'),
      date('2026-08-05T10:00:00Z'), date('2026-08-05T12:00:00Z'),
    )).toBe(true);
  });

  it('treats touching boundaries as overlapping', () => {
    expect(isOverlapping(
      date('2026-08-05T09:00:00Z'), date('2026-08-05T10:00:00Z'),
      date('2026-08-05T10:00:00Z'), date('2026-08-05T11:00:00Z'),
    )).toBe(true);
  });

  it('returns false for separate ranges', () => {
    expect(isOverlapping(
      date('2026-08-05T09:00:00Z'), date('2026-08-05T10:00:00Z'),
      date('2026-08-05T10:01:00Z'), date('2026-08-05T11:00:00Z'),
    )).toBe(false);
  });
});

describe('getEventFormDetailStep', () => {
  it('maps Product Catalog to Helping Hands so general.isPrivate is available', () => {
    expect(getEventFormDetailStep('product_catalog')).toBe('helping_hand');
    expect(getEventFormDetailStep('overview')).toBe('overview');
    expect(getEventFormDetailStep('helping_hand')).toBe('helping_hand');
  });
});

describe('isPermanentLoanEventType', () => {
  it('locks Permanent Loan / Performance Load as always-private, but not Dauerleihgabe', () => {
    expect(isPermanentLoanEventType({ slug: 'permanent-loan' })).toBe(true);
    expect(isPermanentLoanEventType({ name: 'Performance Load' })).toBe(true);
    expect(isPermanentLoanEventType({ slug: 'dauerleihgabe' })).toBe(false);
    expect(isPermanentLoanEventType({ name: 'Dauerleihgabe' })).toBe(false);
    expect(isPermanentLoanEventType({ name: 'Conference' })).toBe(false);
  });
});

describe('isDauerleihgabeEventType', () => {
  it('recognises Dauerleihgabe by name or slug without treating Permanent Loan as Dauerleihgabe', () => {
    expect(isDauerleihgabeEventType({ name: 'Dauerleihgabe' })).toBe(true);
    expect(isDauerleihgabeEventType({ name: '  dauerleihgabe  ' })).toBe(true);
    expect(isDauerleihgabeEventType({ slug: 'dauerleihgabe' })).toBe(true);
    expect(isDauerleihgabeEventType({ name: 'Permanent Loan' })).toBe(false);
  });
});

describe('mapDetailToFormValues list-field guards', () => {
  // The backend returns `{}` instead of `[]` for an empty list on some endpoints
  // (documented in docs/specs/events.md "Contract guards" and CLAUDE.md). `{}` is truthy,
  // so a `(x || []).map(...)` reaches `({}).map` and throws, taking the whole edit-mode
  // wizard down instead of degrading to an empty list.
  const emptyObject = {} as never;

  it('normalises `{}` Overview list fields to arrays instead of throwing', () => {
    const values = mapDetailToFormValues({
      overview: {
        images: emptyObject,
        contacts: emptyObject,
        targetAudience: emptyObject,
        partnershipTypes: emptyObject,
        productPartnerCategories: emptyObject,
      },
    } as never);

    expect(values.images).toEqual([]);
    expect(values.contacts).toEqual([]);
    expect(values.targetAudience).toEqual([]);
    expect(values.partnershipTypes).toEqual([]);
    expect(values.productPartnerCategories).toEqual([]);
  });

  it('normalises `{}` Logistics upload groups to arrays instead of throwing', () => {
    const values = mapDetailToFormValues({
      logistics: {
        accessPermit: emptyObject,
        certifications: emptyObject,
        eventDocuments: emptyObject,
        venueLayouts: emptyObject,
      },
    } as never);

    expect(values.accessPermit).toEqual([]);
    expect(values.certifications).toEqual([]);
    expect(values.eventDocuments).toEqual([]);
    expect(values.venueLayouts).toEqual([]);
  });

  it('normalises `{}` Helping Hands planograms to an array instead of throwing', () => {
    const values = mapDetailToFormValues({
      helpingHands: { assemblyPlanograms: emptyObject },
    } as never);

    expect(values.assemblyPlanograms).toEqual([]);
  });

  it('hydrates doNotPublish from general.isPrivate when overview is absent', () => {
    const values = mapDetailToFormValues({
      general: { id: '1', name: 'Event', startTime: '2026-08-15T00:00:00.000Z', isPrivate: true },
    });

    expect(values.doNotPublish).toBe(true);
  });

  it('still maps real list values through unchanged', () => {
    const values = mapDetailToFormValues({
      overview: { images: ['https://cdn.example.com/folder/photo.png'] },
    } as never);

    expect(values.images).toHaveLength(1);
    expect(values.images[0]).toMatchObject({
      url: 'https://cdn.example.com/folder/photo.png',
      isUploaded: true,
    });
  });
});
