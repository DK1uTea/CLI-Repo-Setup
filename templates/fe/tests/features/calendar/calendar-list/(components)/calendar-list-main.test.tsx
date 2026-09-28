import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CalendarListMain } from '@/features/calendar/calendar-list/(components)/calendar-list-main'

const {
  permissionState,
  setFiltersMock,
  calendarGroupsState,
  deleteEventMock,
  invalidateQueriesMock,
} = vi.hoisted(() => ({
  permissionState: { isWildcardAdmin: true },
  setFiltersMock: vi.fn(),
  calendarGroupsState: { value: [] as Array<{ month: string; total: number; events: Array<{ id: string }> }> },
  deleteEventMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
}))

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('@/shared/components/common/search-input', () => ({ SearchInput: () => null }))
vi.mock('@/shared/hooks/use-infinite-scroll', () => ({ useInfiniteScroll: () => ({ current: null }) }))
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: invalidateQueriesMock }),
}))
vi.mock('@/shared/stores/use-user-store', () => ({
  useHasPermission: () => permissionState.isWildcardAdmin,
}))
vi.mock('@/features/calendar/calendar-list/(hooks)/use-calendar-list-data', () => ({
  useCalendarListData: () => ({ data: { pages: [] }, isLoading: false }),
  mergeCalendarEventGroups: () => calendarGroupsState.value,
}))
vi.mock('@/features/events/event-form/(hooks)/use-delete-event', () => ({
  useDeleteEvent: () => ({ deleteEvent: deleteEventMock, isPending: false }),
}))
vi.mock('@/features/calendar/calendar-list/(hooks)/use-calendar-list-filters', () => ({
  useCalendarListFilters: () => ({
    filters: { timeFrame: 'UPCOMING_ASC', onlyMine: true },
    setFilters: setFiltersMock,
    statusOptions: [], timeFrameOptions: [], eventTypeOptions: [], takeOptions: [],
    searchPlaceholder: 'Search', isOnlyMine: true, toggleOnlyMine: vi.fn(),
  }),
}))
vi.mock('@/features/calendar/calendar-list/(components)/calendar-list-select-filter', () => ({
  CalendarListSelectFilter: ({ label, onChange }: { label: string; onChange: (value: string) => void }) => (
    <button type="button" onClick={() => onChange('all')}>{label}</button>
  ),
}))
vi.mock('@/features/calendar/calendar-list/(components)/calendar-list-date-filter', () => ({ CalendarListDateFilter: () => null }))
vi.mock('@/features/calendar/calendar-list/(components)/calendar-list-partnership-filter', () => ({ CalendarListPartnershipFilter: () => null }))
vi.mock('@/features/calendar/calendar-list/(components)/calendar-list-target-audience-filter', () => ({ CalendarListTargetAudienceFilter: () => null }))
vi.mock('@/features/calendar/calendar-list/(components)/calendar-list-export-filter', () => ({
  CalendarListExportFilter: () => <button type="button">Export Excel</button>,
}))
vi.mock('@/features/calendar/calendar-list/(components)/calendar-list-manager-filter', () => ({ CalendarListManagerFilter: () => null }))
vi.mock('@/features/events/event-list/(components)/event-list-save-filter', () => ({
  EventListSaveFilter: () => <button type="button">saveFilter</button>,
}))
vi.mock('@/features/events/event-list/(hooks)/use-sync-filter-preferences', () => ({
  useSyncFilterPreferences: () => true,
}))
vi.mock('@/features/calendar/calendar-list/(components)/calendar-list-item', () => ({
  CalendarListItem: ({ event, onDeleteClickAction }: {
    event: { id: string }
    onDeleteClickAction?: (event: { id: string }) => void
  }) => (
    <button type="button" onClick={() => onDeleteClickAction?.(event)}>openDelete</button>
  ),
}))
vi.mock('@/features/events/event-list/(components)/event-list-delete-dialog', () => ({
  EventListDeleteDialog: ({ event, onConfirm }: {
    event: { id: string } | null
    onConfirm: (event: { id: string }) => void
  }) => event ? (
    <button type="button" onClick={() => onConfirm(event)}>confirmDelete</button>
  ) : null,
}))

describe('CalendarListMain time frame filter', () => {
  beforeEach(() => {
    permissionState.isWildcardAdmin = true
    setFiltersMock.mockReset()
    calendarGroupsState.value = []
    deleteEventMock.mockReset()
    invalidateQueriesMock.mockReset()
    deleteEventMock.mockImplementation(async (_id: string, onSuccess: () => void) => {
      onSuccess()
      return true
    })
  })

  it('keeps All explicit instead of clearing it back to the Upcoming default', async () => {
    const user = userEvent.setup()
    render(<CalendarListMain />)

    await user.click(screen.getByRole('button', { name: 'filterTimeFrame' }))

    expect(setFiltersMock).toHaveBeenCalledWith({ timeFrame: 'all' })
  })

  it('shows all time frames from the empty state action', async () => {
    const user = userEvent.setup()
    render(<CalendarListMain />)

    await user.click(screen.getByRole('button', { name: 'showMeAll' }))

    expect(setFiltersMock).toHaveBeenCalledWith({ timeFrame: 'all' })
  })

  it('shows Export Excel for a White Card wildcard administrator', () => {
    render(<CalendarListMain />)

    expect(screen.getByRole('button', { name: 'Export Excel' })).toBeInTheDocument()
  })

  it('hides Export Excel for a Calendar Manager without wildcard permission', () => {
    permissionState.isWildcardAdmin = false

    render(<CalendarListMain />)

    expect(screen.queryByRole('button', { name: 'Export Excel' })).not.toBeInTheDocument()
  })

  it('deletes a calendar event and refreshes the calendar list', async () => {
    const user = userEvent.setup()
    calendarGroupsState.value = [
      { month: '2026-08', total: 1, events: [{ id: 'calendar-1' }] },
    ]
    render(<CalendarListMain />)

    await user.click(screen.getByRole('button', { name: 'openDelete' }))
    await user.click(screen.getByRole('button', { name: 'confirmDelete' }))

    expect(deleteEventMock).toHaveBeenCalledWith('calendar-1', expect.any(Function))
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['calendar-list'] })
  })
})
