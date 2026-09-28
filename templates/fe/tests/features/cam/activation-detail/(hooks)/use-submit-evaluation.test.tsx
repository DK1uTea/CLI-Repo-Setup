import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSubmitEvaluation } from '@/features/cam/activation-detail/(hooks)/use-submit-evaluation'

const { post } = vi.hoisted(() => ({ post: vi.fn() }))

vi.mock('@/lib/api', () => ({
  apiProxy: { post },
}))

describe('useSubmitEvaluation', () => {
  beforeEach(() => {
    post.mockReset()
    post.mockResolvedValue({ data: { id: 'evaluation-1' } })
  })

  it('invalidates the grouped activation board after scoring is submitted', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useSubmitEvaluation(), { wrapper })

    await result.current.mutateAsync({
      activationId: 'activation-1',
      maxScore: 27,
      scores: [],
    })

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['cam-activations-grouped'],
    })
  })
})
