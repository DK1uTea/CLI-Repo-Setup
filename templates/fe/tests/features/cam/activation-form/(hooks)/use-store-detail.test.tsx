import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useStoreDetail } from '@/features/cam/activation-form/(hooks)/use-store-detail'

const { get } = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock('@/lib/api', () => ({
  apiProxy: { get },
}))

describe('useStoreDetail', () => {
  beforeEach(() => {
    get.mockReset()
    get.mockResolvedValue({
      data: {
        data: {
          id: 'store-1',
          storeName: 'Store',
          storeAddress: 'Berlin',
          contactName: 'Jane Doe',
          contactPhone: '+49123456789',
          contactEmail: 'jane@example.com',
        },
      },
    })
  })

  it('reuses the cached store when the edit form is opened again', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: 60_000 },
      },
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const first = renderHook(() => useStoreDetail('store-1'), { wrapper })
    await waitFor(() => expect(first.result.current.isSuccess).toBe(true))
    first.unmount()

    const second = renderHook(() => useStoreDetail('store-1'), { wrapper })
    await waitFor(() => expect(second.result.current.isFetching).toBe(false))

    expect(second.result.current.data?.storeName).toBe('Store')
    expect(get).toHaveBeenCalledTimes(1)
  })
})
