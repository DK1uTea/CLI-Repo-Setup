import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EventCalendarMain } from '@/features/events/event-calendar/(components)/event-calendar-main'

const mocks = vi.hoisted(() => ({
  setDate: vi.fn(),
  setView: vi.fn(),
  setFilters: vi.fn(),
  datesSet: undefined as ((arg: unknown) => Promise<void>) | undefined,
  changeCalendarView: undefined as ((view: 'month' | 'week' | 'day') => void) | undefined,
  applyDateRange: undefined as ((from: string, to: string) => void) | undefined,
  resetDateRange: undefined as (() => void) | undefined,
  filters: { status: null, start_date: null, end_date: null } as Record<string, string | null>,
  view: 'month' as 'month' | 'week' | 'day',
  fcProps: undefined as { key?: unknown; initialView: string; initialDate: string; mountCount: number } | undefined,
  fcMountCount: 0,
}))

vi.mock('@/features/events/event-list/(hooks)/use-event-list-filters', () => ({
  useEventListFilters: () => ({
    filters: mocks.filters,
    setFilters: mocks.setFilters,
  }),
}))

vi.mock('@/features/events/event-calendar/(hooks)/use-event-calendar-view', () => ({
  FC_VIEW_NAME: { month: 'dayGridMonth', week: 'timeGridWeek', day: 'timeGridDay' },
  FC_CUSTOM_RANGE_VIEW: 'customRangeGridWeek',
  useEventCalendarView: () => ({
    view: mocks.view,
    date: '2026-08-03',
    initialView: { month: 'dayGridMonth', week: 'timeGridWeek', day: 'timeGridDay' }[mocks.view],
    setView: mocks.setView,
    setDate: mocks.setDate,
  }),
}))

vi.mock('@/features/events/event-calendar/(hooks)/use-event-calendar-data', () => ({
  useEventCalendarData: () => ({ data: { items: [] }, isLoading: false, refetch: vi.fn() }),
}))

vi.mock('@/features/events/event-form/(hooks)/use-delete-event', () => ({
  useDeleteEvent: () => ({ deleteEvent: vi.fn() }),
}))

vi.mock('@/features/events/event-calendar/(components)/event-calendar-fc', () => ({
  EventCalendarFc: ({ calendarRef, initialView, initialDate, onDatesSetAction }: {
    calendarRef: { current: unknown }
    initialView: string
    initialDate: string
    onDatesSetAction: (arg: unknown) => Promise<void>
  }) => {
    calendarRef.current = { getApi: () => ({}) }
    mocks.datesSet = onDatesSetAction
    // Every distinct `key` unmounts the previous instance and mounts a fresh
    // one — this counter (reset per test) stands in for that remount.
    mocks.fcMountCount += 1
    mocks.fcProps = { initialView, initialDate, mountCount: mocks.fcMountCount }
    return <div />
  },
}))

vi.mock('@/features/events/event-calendar/(components)/event-calendar-toolbar', () => ({
  EventCalendarToolbar: ({ onChangeViewAction, onApplyDateRangeAction, onResetDateRangeAction }: {
    onChangeViewAction: (view: 'month' | 'week' | 'day') => void
    onApplyDateRangeAction: (from: string, to: string) => void
    onResetDateRangeAction: () => void
  }) => {
    mocks.changeCalendarView = onChangeViewAction
    mocks.applyDateRange = onApplyDateRangeAction
    mocks.resetDateRange = onResetDateRangeAction
    return <div />
  },
}))
vi.mock('@/features/events/event-calendar/(components)/event-calendar-nav', () => ({
  EventCalendarNav: () => <div />,
}))
vi.mock('@/features/events/event-calendar/(components)/event-calendar-skeleton', () => ({
  EventCalendarSkeleton: () => <div />,
}))
vi.mock('@/features/events/event-calendar/(components)/event-calendar-event-dialog', () => ({
  EventCalendarEventDialog: () => <div />,
}))
vi.mock('@/features/events/event-calendar/(components)/event-calendar-delete-dialog', () => ({
  EventCalendarDeleteDialog: () => <div />,
}))
vi.mock('@/features/events/event-list/(hooks)/use-applied-filter-preferences', () => ({
  useAppliedFilterPreferences: () => ({ isSynced: true }),
}))
vi.mock('@/features/events/event-list/(hooks)/use-sync-filter-preferences', () => ({
  useSyncFilterPreferences: () => true,
}))

describe('EventCalendarMain', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.datesSet = undefined
    mocks.changeCalendarView = undefined
    mocks.applyDateRange = undefined
    mocks.resetDateRange = undefined
    mocks.filters = { status: null, start_date: null, end_date: null }
    mocks.view = 'month'
    mocks.fcProps = undefined
    mocks.fcMountCount = 0
  })

  it("updates the view-date URL but never writes FullCalendar's visible range into the Date filter", async () => {
    let resolveDate!: () => void
    mocks.setDate.mockReturnValue(new Promise<void>((resolve) => { resolveDate = resolve }))
    mocks.setFilters.mockResolvedValue(undefined)
    render(<EventCalendarMain />)

    let updatePromise!: Promise<void>
    act(() => {
      updatePromise = mocks.datesSet?.({
        startStr: '2026-07-27',
        endStr: '2026-09-07',
        view: { title: 'August 2026', currentStart: new Date('2026-08-01T00:00:00Z') },
      }) as Promise<void>
    })

    expect(mocks.setDate).toHaveBeenCalledWith('2026-08-01')
    expect(mocks.setFilters).not.toHaveBeenCalled()

    await act(async () => {
      resolveDate()
      await updatePromise
    })

    // FullCalendar's own visible-range callback must never overwrite the explicit
    // Date-filter range (filters.start_date/end_date) — that field is reserved for
    // what the user picked in EventListDateFilter, otherwise navigating the
    // calendar (next/prev/view change) silently activates a stale Date filter.
    expect(mocks.setFilters).not.toHaveBeenCalled()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it.each([
    ['week', 'timeGridWeek'],
    ['day', 'timeGridDay'],
  ] as const)('opens the %s view at the current date', (view, fullCalendarView) => {
    const { rerender: doRerender } = render(<EventCalendarMain />)

    act(() => mocks.changeCalendarView?.(view))
    expect(mocks.setView).toHaveBeenCalledWith(view)

    // Simulate the nuqs URL state actually updating, then re-render — this is
    // what remounts EventCalendarFc (via its key) with the new view/date
    // instead of an imperative changeView call.
    mocks.view = view
    doRerender(<EventCalendarMain />)

    expect(mocks.fcProps).toMatchObject({ initialView: fullCalendarView })
  })

  it('applies an explicit Date-filter range as a custom week-spanning view, not the view selector', () => {
    const { rerender: doRerender } = render(<EventCalendarMain />)
    const mountCountBefore = mocks.fcMountCount

    act(() => mocks.applyDateRange?.('2026-08-05T00:00:00.000Z', '2026-08-20T00:00:00.000Z'))

    expect(mocks.setFilters).toHaveBeenCalledWith({
      start_date: '2026-08-05T00:00:00.000Z',
      end_date: '2026-08-20T00:00:00.000Z',
    })

    mocks.filters = { status: null, start_date: '2026-08-05T00:00:00.000Z', end_date: '2026-08-20T00:00:00.000Z' }
    doRerender(<EventCalendarMain />)

    // 2026-08-05 (Wed) is in the calendar week starting Monday 2026-08-03.
    expect(mocks.fcProps).toMatchObject({ initialView: 'customRangeGridWeek', initialDate: '2026-08-03' })
    expect(mocks.fcMountCount).toBeGreaterThan(mountCountBefore)
  })

  it('picking a view while a Date-filter range is active clears the range and applies the view instead', () => {
    mocks.filters = { status: null, start_date: '2026-08-05T00:00:00.000Z', end_date: '2026-08-20T00:00:00.000Z' }
    const { rerender: doRerender } = render(<EventCalendarMain />)

    act(() => mocks.changeCalendarView?.('week'))

    expect(mocks.setFilters).toHaveBeenCalledWith({ start_date: null, end_date: null })
    expect(mocks.setView).toHaveBeenCalledWith('week')

    mocks.filters = { status: null, start_date: null, end_date: null }
    mocks.view = 'week'
    doRerender(<EventCalendarMain />)

    expect(mocks.fcProps).toMatchObject({ initialView: 'timeGridWeek' })
  })

  it('resetting the Date filter clears the range and returns to the current view', () => {
    mocks.filters = { status: null, start_date: '2026-08-05T00:00:00.000Z', end_date: '2026-08-20T00:00:00.000Z' }
    const { rerender: doRerender } = render(<EventCalendarMain />)

    act(() => mocks.resetDateRange?.())

    expect(mocks.setFilters).toHaveBeenCalledWith({ start_date: null, end_date: null })

    mocks.filters = { status: null, start_date: null, end_date: null }
    doRerender(<EventCalendarMain />)

    expect(mocks.fcProps).toMatchObject({ initialView: 'dayGridMonth' })
  })
})
