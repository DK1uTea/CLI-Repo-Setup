import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type FullCalendar from '@fullcalendar/react'
import { EventCalendarFc } from '@/features/events/event-calendar/(components)/event-calendar-fc'

const mocks = vi.hoisted(() => ({
  fullCalendarProps: undefined as Record<string, unknown> | undefined,
}))

vi.mock('@fullcalendar/react', () => ({
  default: (props: Record<string, unknown>) => {
    mocks.fullCalendarProps = props
    return <div />
  },
}))

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => key,
}))

describe('EventCalendarFc', () => {
  beforeEach(() => {
    mocks.fullCalendarProps = undefined
  })

  it('formats week and day time-axis labels with hours and minutes', () => {
    render(
      <EventCalendarFc
        calendarRef={createRef<FullCalendar>()}
        events={[]}
        initialView="timeGridWeek"
        initialDate="2026-08-03"
        customRangeWeeks={1}
        onDatesSetAction={vi.fn()}
        onSelectEventAction={vi.fn()}
      />,
    )

    expect(mocks.fullCalendarProps?.slotLabelFormat).toEqual({
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  })

  it('shows only hours and minutes for an event spanning different years', () => {
    const event = {
      id: 'event-1',
      title: 'Cross-year event',
      status: 'ACTIVE' as const,
      startDate: '2026-12-31T22:30:00Z',
      endDate: '2027-01-01T01:15:00Z',
      step: 1,
      type: 'Trade fair',
    }

    render(
      <EventCalendarFc
        calendarRef={createRef<FullCalendar>()}
        events={[event]}
        initialView="timeGridWeek"
        initialDate="2026-12-31"
        customRangeWeeks={1}
        onDatesSetAction={vi.fn()}
        onSelectEventAction={vi.fn()}
      />,
    )

    const eventContent = mocks.fullCalendarProps?.eventContent as (info: unknown) => React.ReactNode
    render(
      eventContent({
        view: { type: 'timeGridWeek' },
        event: { title: event.title, extendedProps: { raw: event } },
      }),
    )

    expect(screen.getByText('22:30 – 01:15')).toBeInTheDocument()
    expect(screen.queryByText(/2026|2027/)).not.toBeInTheDocument()
  })

  it('renders the explicit Date-range grid (customRangeGridWeek) exactly like Month view, not like Week/Day', () => {
    const event = {
      id: 'event-1',
      title: 'Range event',
      status: 'ACTIVE' as const,
      startDate: '2026-08-05T09:00:00Z',
      endDate: '2026-08-05T10:00:00Z',
      step: 1,
      type: 'Trade fair',
    }

    render(
      <EventCalendarFc
        calendarRef={createRef<FullCalendar>()}
        events={[event]}
        initialView="customRangeGridWeek"
        initialDate="2026-08-03"
        customRangeWeeks={3}
        onDatesSetAction={vi.fn()}
        onSelectEventAction={vi.fn()}
      />,
    )

    const eventContent = mocks.fullCalendarProps?.eventContent as (info: unknown) => React.ReactNode
    render(
      eventContent({
        view: { type: 'customRangeGridWeek' },
        event: { title: event.title, extendedProps: { raw: event } },
      }),
    )

    // Month-style event content: a dot + truncated title, no time range shown.
    expect(screen.getByText(event.title)).toBeInTheDocument()
    expect(screen.queryByText('09:00 – 10:00')).not.toBeInTheDocument()

    const dayHeaderContent = mocks.fullCalendarProps?.dayHeaderContent as (arg: unknown) => unknown
    expect(dayHeaderContent({ view: { type: 'customRangeGridWeek' }, text: 'Mon', date: new Date('2026-08-03'), isToday: false })).toBe('Mon')
  })

  it("shows the event's description as plain text, not the raw HTML tags it's stored with", () => {
    const event = {
      id: 'event-1',
      title: 'Week event',
      status: 'ACTIVE' as const,
      startDate: '2026-08-05T09:00:00Z',
      endDate: '2026-08-05T10:00:00Z',
      step: 1,
      type: 'Trade fair',
      description: '<p>Rich <strong>text</strong> description</p>',
    }

    render(
      <EventCalendarFc
        calendarRef={createRef<FullCalendar>()}
        events={[event]}
        initialView="timeGridWeek"
        initialDate="2026-08-03"
        customRangeWeeks={1}
        onDatesSetAction={vi.fn()}
        onSelectEventAction={vi.fn()}
      />,
    )

    const eventContent = mocks.fullCalendarProps?.eventContent as (info: unknown) => React.ReactNode
    render(
      eventContent({
        view: { type: 'timeGridWeek' },
        event: { title: event.title, extendedProps: { raw: event } },
      }),
    )

    expect(screen.getByText('Rich text description')).toBeInTheDocument()
    expect(screen.queryByText(/<p>|<strong>/)).not.toBeInTheDocument()
  })
})
