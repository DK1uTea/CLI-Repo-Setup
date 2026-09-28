import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import {
  mergeEventMonthGroups,
  useEventListData,
} from '@/features/events/event-list/(hooks)/use-event-list-data'
import { apiProxy } from '@/lib/api'

vi.mock('@/lib/api', () => ({ apiProxy: { get: vi.fn() } }))

describe('useEventListData', () => {
  it('sends Product Partner categories in their dedicated API parameter', async () => {
    vi.mocked(apiProxy.get).mockResolvedValue({
      data: {
        data: {
          items: [],
          pagination: { page: 1, hasNextPage: false },
        },
      },
    })
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    renderHook(
      () => useEventListData({
        partnershipTypes: 'PRODUCT_PARTNER',
        productPartnerCategories: 'SOFTDRINKS,WATER',
      } as Parameters<typeof useEventListData>[0]),
      { wrapper },
    )

    await waitFor(() => expect(apiProxy.get).toHaveBeenCalled())
    expect(apiProxy.get).toHaveBeenCalledWith('/etr/events', {
      params: expect.objectContaining({
        page: 1,
        partnershipTypes: ['PRODUCT_PARTNER'],
        productPartnerCategories: ['SOFTDRINKS', 'WATER'],
      }),
      paramsSerializer: { indexes: null },
    })
  })

  it('fetches the next API page reported by pagination', async () => {
    vi.mocked(apiProxy.get)
      .mockResolvedValueOnce({
        data: { data: { items: [], pagination: { page: 1, hasNextPage: true } } },
      })
      .mockResolvedValueOnce({
        data: { data: { items: [], pagination: { page: 2, hasNextPage: false } } },
      })
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useEventListData({ limit: '20' }), { wrapper })

    await waitFor(() => expect(result.current.hasNextPage).toBe(true))
    await result.current.fetchNextPage()

    expect(apiProxy.get).toHaveBeenLastCalledWith('/etr/events', expect.objectContaining({
      params: expect.objectContaining({ page: 2, limit: 20 }),
    }))
    await waitFor(() => expect(result.current.hasNextPage).toBe(false))
  })
})

describe('mergeEventMonthGroups', () => {
  it('combines a month split across API pages', () => {
    const groups = mergeEventMonthGroups([
      { month: '2026-08', total: 1, events: [{ id: 'one', title: 'One' }] },
      { month: '2026-08', total: 1, events: [{ id: 'two', title: 'Two' }] },
      { month: '2026-09', total: 1, events: [{ id: 'three', title: 'Three' }] },
    ] as Parameters<typeof mergeEventMonthGroups>[0])

    expect(groups.map((group) => [group.month, group.events.map((event) => event.id)])).toEqual([
      ['2026-08', ['one', 'two']],
      ['2026-09', ['three']],
    ])
  })

  it('ignores invalid event arrays returned by the API', () => {
    const groups = mergeEventMonthGroups([
      { month: '2026-08', total: 1, events: {} },
    ] as unknown as Parameters<typeof mergeEventMonthGroups>[0])

    expect(groups).toEqual([{ month: '2026-08', total: 0, events: [] }])
  })
})
