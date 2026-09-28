import { describe, expect, it } from 'vitest';
import { dayjs } from '@/lib/date-utils';
import {
  getDefaultRentDateRange,
  validateRentUrlDates,
} from '@/features/rent/(helpers)/rent-date-range';

describe('validateRentUrlDates', () => {
  it('accepts an empty pair as a valid empty range', () => {
    expect(validateRentUrlDates(null, null)).toEqual({
      ok: true,
      empty: true,
      from: null,
      to: null,
    });
  });

  it('rejects garbage, a one-sided range, reversed dates, and a past start', () => {
    expect(validateRentUrlDates('not-a-date', 'also-bad')).toEqual({ ok: false, reason: 'invalid' });
    expect(validateRentUrlDates('2026-08-20T00:00:00.000Z', null)).toEqual({ ok: false, reason: 'incomplete' });
    expect(validateRentUrlDates('2026-08-22T00:00:00.000Z', '2026-08-20T00:00:00.000Z')).toEqual({
      ok: false,
      reason: 'order',
    });
    expect(validateRentUrlDates('2020-01-01T00:00:00.000Z', '2020-01-10T00:00:00.000Z', { rejectPast: true }))
      .toEqual({ ok: false, reason: 'past' });
  });

  it('accepts a future range', () => {
    const from = dayjs.utc().add(1, 'day').startOf('day');
    const to = from.add(3, 'day').endOf('day');
    const result = validateRentUrlDates(from.toISOString(), to.toISOString(), { rejectPast: true });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.empty).toBe(false);
  });
});

describe('getDefaultRentDateRange', () => {
  it('spans today through 10 days ahead in UTC', () => {
    const range = getDefaultRentDateRange();
    const from = dayjs.utc(range.fromIso);
    const to = dayjs.utc(range.toIso);
    expect(from.isSame(dayjs.utc().startOf('day'), 'day')).toBe(true);
    expect(to.diff(from, 'day')).toBe(10);
  });
});
