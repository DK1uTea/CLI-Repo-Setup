import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { EventListMain } from '@/features/events/event-list/(components)/event-list-main'

const { setTimeFrameMock, fetchNextPageMock, useInfiniteScrollMock } = vi.hoisted(() => ({
  setTimeFrameMock: vi.fn(),
  fetchNextPageMock: vi.fn(),
  useInfiniteScrollMock: vi.fn(() => ({ current: null })),
}))

vi.mock('next-intl', () => ({
  useLocale: () => 'de',
  useTranslations: () => (key: string) => key,
}))
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}))
vi.mock('@/shared/components/common/search-input', () => ({ SearchInput: () => null }))
vi.mock('@/shared/hooks/use-infinite-scroll', () => ({
  useInfiniteScroll: useInfiniteScrollMock,
}))
vi.mock('@/features/events/event-form/(hooks)/use-delete-event', () => ({
  useDeleteEvent: () => ({ deleteEvent: vi.fn(), isPending: false }),
}))
vi.mock('@/features/events/event-list/(hooks)/use-event-list-data', () => ({
  useEventListData: () => ({
    data: { pages: [] },
    fetchNextPage: fetchNextPageMock,
    hasNextPage: true,
    isFetchingNextPage: false,
    isLoading: false,
  }),
  mergeEventMonthGroups: () => [],
}))
vi.mock('@/features/events/event-list/(hooks)/use-event-list-filters', () => ({
  useEventListFilters: () => ({
    filters: { timeFrame: 'UPCOMING_ASC', my_event: 'true' },
    setFilters: vi.fn(),
    statusOptions: [],
    timeFrameOptions: [],
    eventTypeOptions: [],
    limitOptions: [],
    partnershipTypesOptions: [],
    searchPlaceholder: 'Search',
    isMyEvent: true,
    toggleMyEvent: vi.fn(),
    setTimeFrame: setTimeFrameMock,
  }),
}))
vi.mock('@/features/events/event-list/(hooks)/use-sync-filter-preferences', () => ({
  useSyncFilterPreferences: () => true,
}))
vi.mock('@/features/events/event-list/(components)/event-list-export-filter', () => ({ EventListExportFilter: () => null }))
vi.mock('@/features/events/event-list/(components)/event-list-save-filter', () => ({ EventListSaveFilter: () => null }))
vi.mock('@/features/events/event-list/(components)/event-list-select-filter', () => ({ EventListSelectFilter: () => null }))
vi.mock('@/features/events/event-list/(components)/event-list-date-filter', () => ({ EventListDateFilter: () => null }))
vi.mock('@/features/events/event-list/(components)/event-list-partnership-filter', () => ({ EventListPartnershipFilter: () => null }))
vi.mock('@/features/events/event-list/(components)/event-list-target-audience-filter', () => ({ EventListTargetAudienceFilter: () => null }))
vi.mock('@/features/events/event-list/(components)/event-list-manager-filter', () => ({ EventListManagerFilter: () => null }))
vi.mock('@/features/events/event-list/(components)/event-list-delete-dialog', () => ({ EventListDeleteDialog: () => null }))

describe('EventListMain empty state', () => {
  beforeEach(() => {
    setTimeFrameMock.mockReset()
    fetchNextPageMock.mockReset()
    useInfiniteScrollMock.mockClear()
  })

  it('shows all time frames from the empty state action', async () => {
    const user = userEvent.setup()
    render(<EventListMain />)

    await user.click(screen.getByRole('button', { name: 'showMeAll' }))

    expect(setTimeFrameMock).toHaveBeenCalledWith('all')
  })

  it('connects the next Event page to the infinite-scroll sentinel', () => {
    render(<EventListMain />)

    expect(useInfiniteScrollMock).toHaveBeenCalledWith({
      onLoadMore: fetchNextPageMock,
      hasMore: true,
      enabled: true,
    })
  })
})
