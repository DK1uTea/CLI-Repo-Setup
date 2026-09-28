import type { ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useEventListFilters } from '@/features/events/event-list/(hooks)/use-event-list-filters'
import type { EventFilterConfigResponse } from '@/features/events/event-list/(hooks)/use-event-filter-config'

const { useEventFilterConfigMock } = vi.hoisted(() => ({
  useEventFilterConfigMock: vi.fn(
    (): { data: EventFilterConfigResponse | undefined; isLoading: boolean } => ({
      data: undefined,
      isLoading: false,
    }),
  ),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('@/features/events/event-list/(hooks)/use-event-filter-config', () => ({
  useEventFilterConfig: useEventFilterConfigMock,
}))

function wrapper({ children }: { children: ReactNode }) {
  return <NuqsTestingAdapter>{children}</NuqsTestingAdapter>
}

describe('useEventListFilters', () => {
  beforeEach(() => {
    useEventFilterConfigMock.mockReturnValue({ data: undefined, isLoading: false })
  })

  it('defaults the time frame to upcoming events', () => {
    const { result } = renderHook(() => useEventListFilters(), { wrapper })

    expect(result.current.filters.timeFrame).toBe('UPCOMING')
  })

  it('keeps All as an explicit time-frame state instead of falling back to Upcoming', async () => {
    const { result } = renderHook(() => useEventListFilters(), { wrapper })

    await act(async () => {
      await result.current.setTimeFrame('all')
    })

    expect(result.current.filters.timeFrame).toBe('all')
  })

  it('defaults limit to unset (no explicit Per Page selection)', () => {
    const { result } = renderHook(() => useEventListFilters(), { wrapper })

    expect(result.current.filters.limit).toBeNull()
  })

  it('exposes the 10/20/50/100 Per Page options plus a Clear/default entry', () => {
    const { result } = renderHook(() => useEventListFilters(), { wrapper })

    expect(result.current.limitOptions).toEqual([
      { value: '10', label: '10' },
      { value: '20', label: '20' },
      { value: '50', label: '50' },
      { value: '100', label: '100' },
      { value: 'all', label: 'takeDefault' },
    ]);
  })

  it('defaults My Event to on', () => {
    const { result } = renderHook(() => useEventListFilters(), { wrapper })

    expect(result.current.filters.my_event).toBe('true')
    expect(result.current.isMyEvent).toBe(true)
  })

  it('toggleMyEvent flips My Event off and back on', async () => {
    const { result } = renderHook(() => useEventListFilters(), { wrapper })

    await act(async () => {
      result.current.toggleMyEvent()
    })
    expect(result.current.filters.my_event).toBe('false')
    expect(result.current.isMyEvent).toBe(false)

    await act(async () => {
      result.current.toggleMyEvent()
    })
    expect(result.current.filters.my_event).toBe('true')
  })

  it('prefixes the backend status options with an "All" entry', () => {
    useEventFilterConfigMock.mockReturnValue({
      data: {
        status: [
          { value: 'ACTIVE', label: 'Active' },
          { value: 'DRAFT', label: 'Draft' },
          { value: 'DELETED', label: 'Deleted' },
        ],
        timeFrame: [],
        eventTypeId: [],
        partnershipTypes: [],
        targetAudience: [],
        createdBy: [],
      },
      isLoading: false,
    })

    const { result } = renderHook(() => useEventListFilters(), { wrapper })

    expect(result.current.statusOptions).toEqual([
      { value: 'all', label: 'statusAll' },
      { value: 'ACTIVE', label: 'Active' },
      { value: 'DRAFT', label: 'Draft' },
      { value: 'DELETED', label: 'Deleted' },
    ])
  })

  it('does not add a duplicate All option when the API timeFrame enum already includes ALL', () => {
    useEventFilterConfigMock.mockReturnValue({
      data: {
        status: [],
        timeFrame: [
          { value: 'UPCOMING', label: 'Upcoming' },
          { value: 'ALL', label: 'All' },
        ],
        eventTypeId: [],
        partnershipTypes: [],
        targetAudience: [],
        createdBy: [],
      },
      isLoading: false,
    })

    const { result } = renderHook(() => useEventListFilters(), { wrapper })

    expect(result.current.timeFrameOptions).toEqual([
      { value: 'UPCOMING', label: 'Upcoming' },
      { value: 'ALL', label: 'All' },
    ])
  })
})
