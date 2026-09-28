import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useUpdateActivationRecord } from '@/features/cam/activation-form/(hooks)/use-update-activation-record'

const { put } = vi.hoisted(() => ({ put: vi.fn() }))

vi.mock('@/lib/api', () => ({
  apiProxy: { put },
}))

describe('useUpdateActivationRecord', () => {
  beforeEach(() => {
    put.mockReset()
    put.mockResolvedValue(undefined)
  })

  it('invalidates the activation contacts after an activation is updated', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useUpdateActivationRecord(), { wrapper })

    await result.current.mutateAsync({
      id: 'activation-1',
      dto: { name: 'Updated activation' },
    })

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['cam-activation-contacts', 'activation-1'],
    })
  })
})
