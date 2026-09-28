import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { useEventCalendarData } from '@/features/events/event-calendar/(hooks)/use-event-calendar-data'
import { apiProxy } from '@/lib/api'

vi.mock('@/lib/api', () => ({ apiProxy: { get: vi.fn() } }))

describe('useEventCalendarData', () => {
  it('serializes array filters as repeated keys without brackets', async () => {
    vi.mocked(apiProxy.get).mockResolvedValue({ data: { data: { items: [] } } })
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    renderHook(() => useEventCalendarData({
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      partnershipTypes: 'PRODUCT_PARTNER,EXHIBITION',
      targetAudience: 'HANDEL,GFGH_GFM',
    }), { wrapper })

    await waitFor(() => expect(apiProxy.get).toHaveBeenCalled())
    expect(apiProxy.get).toHaveBeenCalledWith('/etr/events/calendar-table', {
      params: expect.objectContaining({
        partnershipTypes: ['PRODUCT_PARTNER', 'EXHIBITION'],
        targetAudience: ['HANDEL', 'GFGH_GFM'],
      }),
      paramsSerializer: { indexes: null },
    })
  })

  it('forwards productPartnerCategories as a repeated-key array', async () => {
    vi.mocked(apiProxy.get).mockResolvedValue({ data: { data: { items: [] } } })
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    renderHook(() => useEventCalendarData({
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      partnershipTypes: 'PRODUCT_PARTNER',
      productPartnerCategories: 'SOFTDRINKS,SNACKS',
    }), { wrapper })

    await waitFor(() => expect(apiProxy.get).toHaveBeenCalled())
    expect(apiProxy.get).toHaveBeenCalledWith('/etr/events/calendar-table', {
      params: expect.objectContaining({
        partnershipTypes: ['PRODUCT_PARTNER'],
        productPartnerCategories: ['SOFTDRINKS', 'SNACKS'],
      }),
      paramsSerializer: { indexes: null },
    })
  })
})
