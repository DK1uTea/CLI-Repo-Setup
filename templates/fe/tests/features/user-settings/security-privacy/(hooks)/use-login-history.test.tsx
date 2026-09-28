import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { apiProxy } from '@/lib/api'
import { useLoginHistory } from '@/features/user-settings/security-privacy/(hooks)/use-login-history'

vi.mock('@/lib/api', () => ({ apiProxy: { get: vi.fn() } }))

function Wrapper({ children, searchParams }: { children: React.ReactNode; searchParams?: string }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={queryClient}>
      <NuqsTestingAdapter searchParams={searchParams}>{children}</NuqsTestingAdapter>
    </QueryClientProvider>
  )
}

describe('useLoginHistory', () => {
  beforeEach(() => vi.mocked(apiProxy.get).mockReset())

  it('requests page 1 by default and normalizes an {} items payload to an empty array', async () => {
    vi.mocked(apiProxy.get).mockResolvedValueOnce({
      data: { data: { items: {}, pagination: { totalPages: 1 } } },
    })

    const { result } = renderHook(() => useLoginHistory(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(apiProxy.get).toHaveBeenCalledWith('/auth/histories', { params: { page: 1 } })
    expect(result.current.sessions).toEqual([])
    expect(result.current.page).toBe(1)
  })

  it('reads the page number from the loginHistoryPage URL param', async () => {
    vi.mocked(apiProxy.get).mockResolvedValueOnce({
      data: { data: { items: [], pagination: { totalPages: 3 } } },
    })

    const { result } = renderHook(() => useLoginHistory(), {
      wrapper: (props) => <Wrapper {...props} searchParams="?loginHistoryPage=2" />,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(apiProxy.get).toHaveBeenCalledWith('/auth/histories', { params: { page: 2 } })
    expect(result.current.page).toBe(2)
    expect(result.current.pagination?.totalPages).toBe(3)
  })

  it('falls back to a null pagination and empty sessions array when the query has not resolved yet', () => {
    vi.mocked(apiProxy.get).mockReturnValueOnce(new Promise(() => {}))

    const { result } = renderHook(() => useLoginHistory(), { wrapper: Wrapper })

    expect(result.current.sessions).toEqual([])
    expect(result.current.pagination).toBeNull()
    expect(result.current.isLoading).toBe(true)
  })
})
