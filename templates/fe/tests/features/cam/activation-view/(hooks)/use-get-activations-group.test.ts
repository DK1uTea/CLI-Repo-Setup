import { createElement, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { describe, expect, it, vi } from 'vitest'
import { useGetActivationsGroup } from '@/features/cam/activation-view/(hooks)/use-get-activations-group'

const { get } = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock('@/lib/api', () => ({
  apiProxy: { get },
}))

describe('useGetActivationsGroup', () => {
  it('reports loading while cached groups are being refetched', async () => {
    get.mockReturnValue(new Promise(() => undefined))
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: 0 } },
    })
    queryClient.setQueryData(
      ['cam-activations-grouped', { search: '', sortBy: 'NAME_ASC' }],
      { groups: [{ status: 'REVIEW', items: [] }] },
    )
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(NuqsTestingAdapter, null, children),
      )

    const { result } = renderHook(() => useGetActivationsGroup(), { wrapper })

    await waitFor(() => expect(get).toHaveBeenCalled())
    expect(result.current.isLoading).toBe(true)
  })
})
