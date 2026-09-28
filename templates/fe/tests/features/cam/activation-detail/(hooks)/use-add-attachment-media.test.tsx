import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useAddAttachmentMedia } from '@/features/cam/activation-detail/(hooks)/use-add-attachment-media'

const { patch } = vi.hoisted(() => ({ patch: vi.fn() }))

vi.mock('@/lib/api', () => ({
  apiProxy: { patch },
}))

describe('useAddAttachmentMedia', () => {
  it('invalidates detail and board counters after media is added', async () => {
    patch.mockResolvedValue({ data: { ok: true } })
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useAddAttachmentMedia('activation-1'), { wrapper })

    result.current.mutate({ type: 'ahMarketMediaUrls', urls: ['media/key'] })

    await waitFor(() => expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['cam-activations-grouped'],
    }))
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['cam-activation-detail', 'activation-1'],
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['cam-activation-admin-list'],
    })
  })
})
