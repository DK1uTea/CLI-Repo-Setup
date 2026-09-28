import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { useRentalProductDetail } from '@/features/rent/product-detail/(hooks)/use-rental-product-detail'
import { apiProxy } from '@/lib/api'

vi.mock('@/lib/api', () => ({ apiProxy: { get: vi.fn() } }))

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useRentalProductDetail', () => {
  it('does not fetch when the rent date range is not yet ready (no from/to)', () => {
    renderHook(() => useRentalProductDetail('chair'), { wrapper })

    expect(apiProxy.get).not.toHaveBeenCalled()
  })

  it('does not fetch when only one of from/to is provided', () => {
    renderHook(() => useRentalProductDetail('chair', { from: '2026-08-01' }), { wrapper })

    expect(apiProxy.get).not.toHaveBeenCalled()
  })

  it('fetches the product detail once both from and to are set, re-fetching when the range changes', async () => {
    vi.mocked(apiProxy.get).mockResolvedValue({ data: { data: { id: '1', sku: 'SKU1', name: 'Chair' } } })

    const { result, rerender } = renderHook(
      ({ from, to }) => useRentalProductDetail('chair', { from, to }),
      { wrapper, initialProps: { from: '2026-08-01', to: '2026-08-10' } },
    )

    await waitFor(() => expect(result.current.rentalProductDetail?.name).toBe('Chair'))
    expect(apiProxy.get).toHaveBeenCalledWith('etr/products/chair', {
      params: { from: '2026-08-01', to: '2026-08-10' },
    })

    rerender({ from: '2026-08-05', to: '2026-08-15' })

    await waitFor(() => expect(apiProxy.get).toHaveBeenCalledWith('etr/products/chair', {
      params: { from: '2026-08-05', to: '2026-08-15' },
    }))
  })

  it('exposes undefined instead of null while there is no data yet', () => {
    const { result } = renderHook(() => useRentalProductDetail('chair'), { wrapper })

    expect(result.current.rentalProductDetail).toBeUndefined()
  })
})
