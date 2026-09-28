import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { useRelatedProducts } from '@/features/rent/product-detail/(hooks)/use-related-products'
import { apiProxy } from '@/lib/api'

vi.mock('@/lib/api', () => ({ apiProxy: { get: vi.fn() } }))

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useRelatedProducts', () => {
  it('does not fetch when slug is empty', () => {
    renderHook(() => useRelatedProducts(''), { wrapper })

    expect(apiProxy.get).not.toHaveBeenCalled()
  })

  it('fetches related products for the given slug', async () => {
    vi.mocked(apiProxy.get).mockResolvedValueOnce({ data: { data: { items: [{ id: '1', name: 'Table' }] } } })

    const { result } = renderHook(() => useRelatedProducts('chair'), { wrapper })

    await waitFor(() => expect(result.current.data).toEqual([{ id: '1', name: 'Table' }]))
    expect(apiProxy.get).toHaveBeenCalledWith('etr/products/related', { params: { slug: 'chair' } })
  })

  it('normalises a non-array items field to an empty list instead of throwing', async () => {
    vi.mocked(apiProxy.get).mockResolvedValueOnce({ data: { data: { items: null } } })

    const { result } = renderHook(() => useRelatedProducts('chair'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })
})
