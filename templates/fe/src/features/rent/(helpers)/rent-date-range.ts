import { dayjs } from '@/lib/date-utils';

export const RENT_DEFAULT_RANGE_DAYS = 10;

export function getDefaultRentDateRange() {
  const from = dayjs.utc().startOf('day');
  const to = from.add(RENT_DEFAULT_RANGE_DAYS, 'day').endOf('day');
  return {
    from: from.toDate(),
    to: to.toDate(),
    fromIso: from.toISOString(),
    toIso: to.toISOString(),
  };
}

export function parseRentQueryDate(value?: string | null) {
  if (!value?.trim()) return null;
  const date = dayjs.utc(value);
  return date.isValid() ? date.toDate() : null;
}

export type RentDateRangeResult =
  | { ok: true; empty: boolean; from: Date | null; to: Date | null; fromIso?: string; toIso?: string }
  | { ok: false; reason: 'invalid' | 'incomplete' | 'order' | 'past' };

export function validateRentUrlDates(
  start?: string | null,
  end?: string | null,
  options?: { rejectPast?: boolean },
): RentDateRangeResult {
  const hasStart = !!start?.trim();
  const hasEnd = !!end?.trim();

  if (!hasStart && !hasEnd) {
    return { ok: true, empty: true, from: null, to: null };
  }
  if (hasStart !== hasEnd) return { ok: false, reason: 'incomplete' };

  const from = parseRentQueryDate(start);
  const to = parseRentQueryDate(end);
  if (!from || !to) return { ok: false, reason: 'invalid' };
  if (dayjs.utc(to).isBefore(dayjs.utc(from), 'day')) return { ok: false, reason: 'order' };

  if (options?.rejectPast) {
    const today = dayjs.utc().startOf('day');
    if (dayjs.utc(from).isBefore(today, 'day')) return { ok: false, reason: 'past' };
  }

  return {
    ok: true,
    empty: false,
    from,
    to,
    fromIso: dayjs.utc(from).toISOString(),
    toIso: dayjs.utc(to).toISOString(),
  };
}
