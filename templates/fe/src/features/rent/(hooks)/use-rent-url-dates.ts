'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { parseAsString, useQueryStates } from 'nuqs';
import { toast } from 'sonner';
import { dayjs } from '@/lib/date-utils';
import { getDefaultRentDateRange, validateRentUrlDates } from '../(helpers)/rent-date-range';

type Options = {
  requireRange?: boolean;
  syncInvalid?: boolean;
};

export function useRentUrlDates(options: Options = {}) {
  const { requireRange = false, syncInvalid = false } = options;
  const t = useTranslations('rent');
  const [params, setParams] = useQueryStates({
    start_date: parseAsString,
    end_date: parseAsString,
  });

  const result = validateRentUrlDates(params.start_date, params.end_date, { rejectPast: true });
  const needsDefault = requireRange && result.ok && result.empty;
  const isInvalid = !result.ok;

  useEffect(() => {
    if (!syncInvalid) return;

    if (needsDefault) {
      const fallback = getDefaultRentDateRange();
      void setParams({ start_date: fallback.fromIso, end_date: fallback.toIso });
      return;
    }

    if (!isInvalid) return;

    toast.error(t('invalidDateRange'));
    const fallback = getDefaultRentDateRange();
    void setParams({ start_date: fallback.fromIso, end_date: fallback.toIso });
  }, [isInvalid, needsDefault, params.end_date, params.start_date, setParams, syncInvalid, t]);

  const fallback = getDefaultRentDateRange();
  const from = result.ok && !result.empty ? result.from : requireRange ? fallback.from : null;
  const to = result.ok && !result.empty ? result.to : requireRange ? fallback.to : null;

  return {
    from,
    to,
    fromIso: result.ok ? result.fromIso : undefined,
    toIso: result.ok ? result.toIso : undefined,
    isReady: result.ok && (!requireRange || !result.empty),
    isInvalid,
    setDateRange: (next: { from?: Date; to?: Date }) => {
      void setParams({
        start_date: next.from ? dayjs.utc(next.from).startOf('day').toISOString() : null,
        end_date: next.to ? dayjs.utc(next.to).endOf('day').toISOString() : null,
      });
    },
  };
}
