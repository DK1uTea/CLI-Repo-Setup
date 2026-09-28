import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { useProductList } from '@/features/rent/catalogue/(hooks)/use-product-list'
import { apiProxy } from '@/lib/api'

vi.mock('@/lib/api', () => ({ apiProxy: { get: vi.fn() } }))

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useProductList', () => {
  it('requests the catalogue with the given page/limit/search/category/date params', async () => {
    vi.mocked(apiProxy.get).mockResolvedValueOnce({
      data: { data: { items: [], pagination: { page: 1, totalPages: 1 } } },
    })

    renderHook(
      () => useProductList({ page: 2, limit: 12, search: 'chair', categorySlug: 'theken', from: '2026-08-01', to: '2026-08-10' }),
      { wrapper },
    )

    await waitFor(() => expect(apiProxy.get).toHaveBeenCalledWith('etr/products', {
      params: { page: 2, limit: 12, search: 'chair', categorySlug: 'theken', from: '2026-08-01', to: '2026-08-10' },
    }))
  })

  it('normalises a non-array items field to an empty list instead of throwing', async () => {
    vi.mocked(apiProxy.get).mockResolvedValueOnce({
      data: { data: { items: {}, pagination: null } },
    })

    const { result } = renderHook(() => useProductList({ page: 1, limit: 12 }), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.products).toEqual([])
    expect(result.current.data?.pagination).toBeNull()
  })

  it('returns the products and pagination from a well-formed response', async () => {
    const items = [{ id: '1', sku: 'SKU1', name: 'Chair', price: 10, productType: 'rental', slug: 'chair', isAvailable: true, totalQuantity: 5, availableQuantity: 2 }]
    vi.mocked(apiProxy.get).mockResolvedValueOnce({
      data: { data: { items, pagination: { page: 1, totalPages: 3 } } },
    })

    const { result } = renderHook(() => useProductList({ page: 1, limit: 12 }), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.products).toEqual(items)
    expect(result.current.data?.pagination).toEqual({ page: 1, totalPages: 3 })
  })
})
