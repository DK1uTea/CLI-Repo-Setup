import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CONTACTS_QUERY_KEY, useListContacts } from '@/features/cam/activation-detail/(hooks)/use-list-contacts'

const { get } = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock('@/lib/api', () => ({
  apiProxy: { get },
}))

describe('useListContacts', () => {
  it('reports loading while cached contacts are being refetched', async () => {
    get.mockReturnValue(new Promise(() => undefined))
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: 0 } },
    })
    queryClient.setQueryData([CONTACTS_QUERY_KEY, 'activation-1'], {
      pages: [{
        items: [{ id: 'contact-1', name: 'Old contact', email: '', tel: '', isOwner: true }],
        pagination: { page: 1, limit: 10, hasNextPage: false },
      }],
      pageParams: [1],
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useListContacts('activation-1'), { wrapper })

    await waitFor(() => expect(get).toHaveBeenCalled())
    expect(result.current.isLoading).toBe(true)
  })
})
