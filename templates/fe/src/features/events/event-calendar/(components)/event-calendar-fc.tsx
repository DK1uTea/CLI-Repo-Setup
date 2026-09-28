'use client'

import { type RefObject, useEffect, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import deLocale from '@fullcalendar/core/locales/de'
import enLocale from '@fullcalendar/core/locales/en-gb'
import type {
  DatesSetArg,
  DayHeaderContentArg,
  EventClickArg,
  EventContentArg,
  EventInput,
  MoreLinkContentArg,
} from '@fullcalendar/core'
import { useLocale, useTranslations } from 'next-intl'
import { dayjs } from '@/lib/date-utils'
import { stripHtmlToPlainText } from '@/lib/html-utils'
import type { CalendarEvent } from '@/features/events/event-calendar/(hooks)/use-event-calendar-data'
import { FC_CUSTOM_RANGE_VIEW } from '@/features/events/event-calendar/(hooks)/use-event-calendar-view'
import { EventCalendarMorePopover } from './event-calendar-more-popover'

const DAY_MAX_EVENTS = 3
const TIMEGRID_MAX_STACK = 2
const TIMEGRID_DAY_MAX_STACK = 7
const FIRST_DAY_MONDAY = 1
const SLOT_MIN_TIME = '00:00:00'
const SLOT_MAX_TIME = '24:00:00'

/** Maps domain events to FullCalendar inputs; stashes the original object in extendedProps.raw. */
export function toFullCalendarEvents(events: CalendarEvent[]): EventInput[] {
  return events.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.startDate,
    end: event.endDate,
    extendedProps: { raw: event },
  }))
}

type MorePopoverState = {
  anchorEl: HTMLElement
  date: Date
  dayEvents: CalendarEvent[]
} | null

type Props = {
  calendarRef: RefObject<FullCalendar | null>
  events: CalendarEvent[]
  initialView: string
  initialDate: string
  customRangeWeeks: number
  onDatesSetAction: (arg: DatesSetArg) => void
  onSelectEventAction: (event: CalendarEvent) => void
}

export function EventCalendarFc({
  calendarRef,
  events,
  initialView,
  initialDate,
  customRangeWeeks,
  onDatesSetAction,
  onSelectEventAction,
}: Props) {
  const locale = useLocale()
  const t = useTranslations('events.calendar')
  const [morePopover, setMorePopover] = useState<MorePopoverState>(null)

  function renderEventContent(info: EventContentArg) {
    // The explicit-Date-range grid is Month view with a different week count —
    // it must render identically, not like Week/Day's timed event style.
    const isMonth = info.view.type === 'dayGridMonth' || info.view.type === FC_CUSTOM_RANGE_VIEW
    const raw = info.event.extendedProps.raw as CalendarEvent

    if (isMonth) {
      return (
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="fc-mep-dot size-1.5 shrink-0 rounded-full bg-primary" />
          <span className="truncate">{info.event.title}</span>
        </div>
      )
    }

    const start = dayjs.utc(raw.startDate).locale(locale === 'de' ? 'de' : 'en')
    const end = dayjs.utc(raw.endDate).locale(locale === 'de' ? 'de' : 'en')

    const timeRange = `${start.format('HH:mm')} – ${end.format('HH:mm')}`
    const description = raw.description ? stripHtmlToPlainText(raw.description) : ''

    return (
      <div className="flex flex-col overflow-hidden px-0.5 py-0.5">
        <span className="truncate font-semibold leading-snug">{info.event.title}</span>
        <span className="shrink-0 text-[11px] opacity-80">{timeRange}</span>
        {description && (
          <span className="truncate text-[11px] leading-snug opacity-70">{description}</span>
        )}
      </div>
    )
  }

  function renderMoreLink(arg: MoreLinkContentArg) {
    return t('moreEvents', { count: arg.num })
  }

  function renderDayHeader(arg: DayHeaderContentArg) {
    if (arg.view.type === 'dayGridMonth' || arg.view.type === FC_CUSTOM_RANGE_VIEW) return arg.text
    const d = dayjs.utc(arg.date).locale(locale === 'de' ? 'de' : 'en')
    return (
      <div className="flex flex-col items-center gap-0.5 py-1 leading-none">
        <span>{d.format('ddd')}</span>
        <span className="font-bold">{d.format('D')}</span>
      </div>
    )
  }

  const innerRef = useRef<HTMLDivElement>(null)
  const eventsRef = useRef(events)
  eventsRef.current = events

  useEffect(() => {
    const container = innerRef.current
    if (!container) return
    function interceptMoreLink(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest('.fc-more-link')) return
      e.stopPropagation()
      e.preventDefault()
      const btn = target.closest('.fc-more-link') as HTMLElement | null
      const dayEl = target.closest('[data-date]') as HTMLElement | null
      if (!btn || !dayEl?.dataset.date) return
      const clickedDate = dayjs.utc(dayEl.dataset.date)
      const dayStart = clickedDate.startOf('day')
      const dayEnd = clickedDate.endOf('day')
      const dayEvents = eventsRef.current.filter((ev) => {
        const start = dayjs.utc(ev.startDate)
        const end = dayjs.utc(ev.endDate)
        return start.isBefore(dayEnd) && end.isAfter(dayStart)
      })
      setMorePopover({ anchorEl: btn, date: clickedDate.toDate(), dayEvents })
    }
    container.addEventListener('click', interceptMoreLink, true)
    return () => container.removeEventListener('click', interceptMoreLink, true)
  }, [])

  return (
    <div className="overflow-x-auto rounded-lg border bg-card _custom-scroll">
      <div ref={innerRef} className="fc-theme-mep min-w-4xl">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={false}
          initialView={initialView}
          initialDate={initialDate}
          firstDay={FIRST_DAY_MONDAY}
          timeZone="UTC"
          locales={[deLocale, enLocale]}
          locale={locale === 'de' ? 'de' : 'en-gb'}
          height="auto"
          dayMaxEvents={DAY_MAX_EVENTS}
          eventMaxStack={TIMEGRID_MAX_STACK}
          views={{
            timeGridDay: { eventMaxStack: TIMEGRID_DAY_MAX_STACK },
            // nowIndicator only makes sense against a time axis (week/day) — on a
            // dayGrid view it draws as a bare red line above today's cell with no
            // time to indicate, which the legacy calendar never had.
            dayGridMonth: { nowIndicator: false },
            [FC_CUSTOM_RANGE_VIEW]: { type: 'dayGrid', duration: { weeks: customRangeWeeks }, nowIndicator: false },
          }}
          eventDisplay="block"
          nowIndicator
          slotMinTime={SLOT_MIN_TIME}
          slotMaxTime={SLOT_MAX_TIME}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
          allDaySlot={false}
          events={toFullCalendarEvents(events)}
          eventContent={renderEventContent}
          moreLinkContent={renderMoreLink}
          dayHeaderContent={renderDayHeader}
          datesSet={onDatesSetAction}
          eventClick={(arg: EventClickArg) => {
            arg.jsEvent.preventDefault()
            setMorePopover(null)
            onSelectEventAction(arg.event.extendedProps.raw as CalendarEvent)
          }}
          fixedWeekCount={false} // just render the number of weeks needed for the month, don't force 6
        />
      </div>
      {morePopover && (
        <EventCalendarMorePopover
          date={morePopover.date}
          events={morePopover.dayEvents}
          anchorEl={morePopover.anchorEl}
          onClose={() => setMorePopover(null)}
          onSelectEvent={(event) => {
            setMorePopover(null)
            onSelectEventAction(event)
          }}
        />
      )}
    </div>
  )
}
