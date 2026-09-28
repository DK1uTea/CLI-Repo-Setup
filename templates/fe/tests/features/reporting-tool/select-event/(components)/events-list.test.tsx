import { act, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NextIntlClientProvider } from 'next-intl'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import EventsList from '@/features/reporting-tool/select-event/(components)/events-list'
import { apiProxy } from '@/lib/api'
import messages from '@/messages/de.json'

const { infiniteScrollState } = vi.hoisted(() => ({
  infiniteScrollState: {
    onLoadMore: null as null | (() => void),
  },
}))

vi.mock('@/lib/api', () => ({
  apiProxy: { get: vi.fn() },
}))

vi.mock('@/shared/hooks/use-infinite-scroll', () => ({
  useInfiniteScroll: ({ onLoadMore }: { onLoadMore: () => void }) => {
    infiniteScrollState.onLoadMore = onLoadMore
    return { current: null }
  },
}))

vi.mock('@/features/reporting-tool/(components)/trade-fair-event-card', () => ({
  default: ({ event }: { event: { name: string } }) => <article>{event.name}</article>,
}))

function renderEventsList() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <NextIntlClientProvider locale="de" messages={messages}>
          <NuqsTestingAdapter>{children}</NuqsTestingAdapter>
        </NextIntlClientProvider>
      </QueryClientProvider>
    )
  }

  return render(<EventsList />, { wrapper: Wrapper })
}

describe('EventsList infinite scroll', () => {
  beforeEach(() => {
    infiniteScrollState.onLoadMore = null
    vi.mocked(apiProxy.get).mockReset()
  })

  it('appends the next offset page when the scroll sentinel is reached', async () => {
    vi.mocked(apiProxy.get)
      .mockResolvedValueOnce({
        data: {
          data: {
            items: [{ id: 'event-1', name: 'Event one' }],
            pagination: { page: 1, limit: 10, total: 2, totalPages: 2, hasNextPage: true, hasPrevPage: false },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            items: [{ id: 'event-2', name: 'Event two' }],
            pagination: { page: 2, limit: 10, total: 2, totalPages: 2, hasNextPage: false, hasPrevPage: true },
          },
        },
      })

    renderEventsList()

    expect(await screen.findByText('Event one')).toBeInTheDocument()

    await act(async () => {
      infiniteScrollState.onLoadMore?.()
    })

    expect(await screen.findByText('Event two')).toBeInTheDocument()
    expect(screen.getByText('Event one')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'pagination' })).not.toBeInTheDocument()
    await waitFor(() => expect(apiProxy.get).toHaveBeenCalledTimes(2))
    expect(apiProxy.get).toHaveBeenNthCalledWith(1, 'tf/events', {
      params: { page: 1, limit: 10 },
    })
    expect(apiProxy.get).toHaveBeenNthCalledWith(2, 'tf/events', {
      params: { page: 2, limit: 10 },
    })
  })
})
