'use client'

import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type FullCalendar from '@fullcalendar/react'
import type { DatesSetArg } from '@fullcalendar/core'
import { dayjs, nowUtc } from '@/lib/date-utils'
import { useEventListFilters } from '@/features/events/event-list/(hooks)/use-event-list-filters'
import { useSyncFilterPreferences } from '@/features/events/event-list/(hooks)/use-sync-filter-preferences'
import {
  eventListUrlHasExplicitFilters,
  savedToEventCalendarUrl,
} from '@/features/events/event-list/(helpers)/user-filter-preferences'
import { useEventCalendarData, type CalendarEvent } from '@/features/events/event-calendar/(hooks)/use-event-calendar-data'
import { useDeleteEvent } from '@/features/events/event-form/(hooks)/use-delete-event'
import {
  useEventCalendarView,
  FC_CUSTOM_RANGE_VIEW,
  FC_VIEW_NAME,
  type CalendarViewKey,
} from '../(hooks)/use-event-calendar-view'
import { EventCalendarToolbar } from './event-calendar-toolbar'
import { EventCalendarNav } from './event-calendar-nav'
import { EventCalendarFc } from './event-calendar-fc'
import { EventCalendarSkeleton } from './event-calendar-skeleton'
import { EventCalendarEventDialog } from './event-calendar-event-dialog'
import { EventCalendarDeleteDialog } from './event-calendar-delete-dialog'

const MIN_CUSTOM_RANGE_WEEKS = 1

/** Monday of the calendar week (Mon-Sun) containing `date`, matching the grid's firstDay=Monday. */
function startOfCalendarWeek(date: dayjs.Dayjs) {
  const isoDay = date.day() === 0 ? 7 : date.day() // Sunday (0) -> 7
  return date.subtract(isoDay - 1, 'day').startOf('day')
}

/** Number of calendar weeks (Mon-Sun) needed to cover an explicit [from, to] date range. */
function weeksBetween(from: string, to: string): number {
  const start = startOfCalendarWeek(dayjs.utc(from))
  const end = startOfCalendarWeek(dayjs.utc(to)).add(6, 'day').endOf('day')
  const weeks = Math.ceil(end.diff(start, 'day') / 7)
  return Math.max(weeks, MIN_CUSTOM_RANGE_WEEKS)
}

export function EventCalendarMain() {
  const { filters, setFilters } = useEventListFilters()
  const { view, date, setView, setDate } = useEventCalendarView()
  const [calendarRange, setCalendarRange] = useState<{ startDate: string; endDate: string } | null>(null)

  const calendarRef = useRef<FullCalendar>(null)
  const api = () => calendarRef.current?.getApi()

  // An explicit Date-filter range (EventListDateFilter) takes priority over the
  // view selector: it renders as a custom dayGrid view spanning exactly the
  // selected weeks, and clears whenever the user picks a view instead.
  const hasExplicitDateRange = !!filters.start_date && !!filters.end_date
  const customRangeWeeks = hasExplicitDateRange
    ? weeksBetween(filters.start_date!, filters.end_date!)
    : MIN_CUSTOM_RANGE_WEEKS

  // FullCalendar reuses a day-grid view's header/day-cell DOM across `changeView`
  // calls within the same "family" (dayGridMonth <-> the registered custom range
  // view), even though their dayHeaderContent renders different markup for each —
  // this duplicated the weekday header instead of replacing it. Keying FullCalendar
  // by which grid is active forces React to unmount/remount a fresh instance
  // instead, so `initialView`/`initialDate` below is all that's needed — no
  // imperative `changeView` call for switching grids.
  const activeGridKey = hasExplicitDateRange ? FC_CUSTOM_RANGE_VIEW : view
  const calendarFcView = hasExplicitDateRange ? FC_CUSTOM_RANGE_VIEW : FC_VIEW_NAME[view]
  const calendarFcDate = hasExplicitDateRange
    ? startOfCalendarWeek(dayjs.utc(filters.start_date!)).format('YYYY-MM-DD')
    : date

  const prefsReady = useSyncFilterPreferences(
    'EVENT_NAVIGATOR_CALENDAR',
    eventListUrlHasExplicitFilters(filters),
    async (saved) => {
      const restored = savedToEventCalendarUrl(saved)
      setFilters(restored.filters)
      await setView(restored.view)
    },
  )

  const { timeFrame, limit, start_date, end_date, ...calendarFilters } = filters
  const calendarStatus = ['active', 'draft'].includes(filters.status?.toLowerCase() ?? '')
    ? filters.status?.toLowerCase()
    : 'active'

  const { data: listResponse, isLoading, refetch } = useEventCalendarData(
    {
      ...calendarFilters,
      status: calendarStatus,
      startDate: filters.start_date || calendarRange?.startDate || '',
      endDate: filters.end_date || calendarRange?.endDate || '',
    },
    {
      enabled: prefsReady
        && !!(filters.start_date || calendarRange?.startDate)
        && !!(filters.end_date || calendarRange?.endDate),
    },
  )
  const events = listResponse?.items ?? []
  const { deleteEvent } = useDeleteEvent()

  const [title, setTitle] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null)

  async function handleDatesSet(arg: DatesSetArg) {
    const nextTitle = arg.view.title
    const nextDate = dayjs.utc(arg.view.currentStart).format('YYYY-MM-DD')
    const nextStart = arg.startStr
    const nextEnd = arg.endStr

    if (title !== nextTitle) {
      setTitle(nextTitle)
    }
    if (date !== nextDate) {
      await setDate(nextDate)
    }

    // The visible range FullCalendar reports here only drives the data fetch
    // (calendarRange) — it must never be written back into filters.start_date/
    // end_date, which is reserved for an explicit user-picked Date filter range.
    if (!calendarRange || calendarRange.startDate !== nextStart || calendarRange.endDate !== nextEnd) {
      setCalendarRange({
        startDate: nextStart,
        endDate: nextEnd,
      })
    }
  }

  function handleChangeView(next: CalendarViewKey) {
    if (next === 'week' || next === 'day') {
      const today = dayjs.utc(nowUtc()).format('YYYY-MM-DD')
      setDate(today)
    }
    setView(next)
    // Picking a view explicitly overrides any active Date-filter range.
    // Both this and setView above change activeGridKey, remounting
    // EventCalendarFc with the right initialView/initialDate — no imperative
    // changeView call needed.
    if (hasExplicitDateRange) {
      setFilters({ start_date: null, end_date: null })
    }
  }

  function handleApplyDateRange(from: string, to: string) {
    setFilters({ start_date: from, end_date: to })
  }

  function handleResetDateRange() {
    setFilters({ start_date: null, end_date: null })
  }

  return (
    <div className="flex flex-col gap-4">
      <EventCalendarToolbar
        viewKey={view}
        onChangeViewAction={handleChangeView}
        onApplyDateRangeAction={handleApplyDateRange}
        onResetDateRangeAction={handleResetDateRange}
      />
      <EventCalendarNav
        title={title}
        onPrevAction={() => api()?.prev()}
        onNextAction={() => api()?.next()}
        onTodayAction={() => api()?.today()}
      />

      <div className="relative">
        {!calendarRange && <EventCalendarSkeleton />}
        <div
          className={cn(
            !calendarRange && 'invisible absolute pointer-events-none',
            isLoading && 'opacity-50 pointer-events-none',
          )}
        >
          <EventCalendarFc
            key={activeGridKey}
            calendarRef={calendarRef}
            events={events ?? []}
            initialView={calendarFcView}
            initialDate={calendarFcDate}
            customRangeWeeks={customRangeWeeks}
            onDatesSetAction={handleDatesSet}
            onSelectEventAction={setSelectedEvent}
          />
        </div>
      </div>

      <EventCalendarEventDialog
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onDeleteClickAction={(event) => {
          setSelectedEvent(null)
          setEventToDelete(event)
        }}
      />

      <EventCalendarDeleteDialog
        event={eventToDelete}
        onClose={() => setEventToDelete(null)}
        onConfirm={async (event) => {
          await deleteEvent(event.id, () => {
            refetch()
          })
          setEventToDelete(null)
        }}
      />
    </div>
  )
}
