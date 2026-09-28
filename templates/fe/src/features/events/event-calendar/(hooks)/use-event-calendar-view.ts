'use client'

import { parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs'
import { dayjs, nowUtc } from '@/lib/date-utils'

export type CalendarViewKey = 'month' | 'week' | 'day'

/** Registered FullCalendar view name for an explicit Date-filter range (custom week count). */
export const FC_CUSTOM_RANGE_VIEW = 'customRangeGridWeek'

/** Maps our URL view key to FullCalendar's internal view name. */
export const FC_VIEW_NAME: Record<CalendarViewKey, string> = {
  month: 'dayGridMonth',
  week: 'timeGridWeek',
  day: 'timeGridDay',
}

const TODAY = dayjs.utc(nowUtc()).format('YYYY-MM-DD')

export function useEventCalendarView() {
  const [{ view, date }, setState] = useQueryStates({
    view: parseAsStringEnum<CalendarViewKey>(['month', 'week', 'day']).withDefault('month'),
    date: parseAsString.withDefault(TODAY),
  })

  return {
    view,
    date,
    initialView: FC_VIEW_NAME[view],
    setView: (next: CalendarViewKey) => setState({ view: next }),
    setDate: (next: string) => setState({ date: next === TODAY ? null : next }),
  }
}
