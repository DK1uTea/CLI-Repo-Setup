import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NextIntlClientProvider } from 'next-intl'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import EventAnalyticsLeadsTimeline from '@/features/reporting-tool/event-analytics/(components)/event-analytics-leads-timeline'
import { apiProxy } from '@/lib/api'
import messages from '@/messages/de.json'

vi.mock('@/lib/api', () => ({
  apiProxy: { get: vi.fn() },
}))

function renderTimeline() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <NextIntlClientProvider locale="de" messages={messages}>
          <NuqsTestingAdapter searchParams="?eventId=event-1">
            {children}
          </NuqsTestingAdapter>
        </NextIntlClientProvider>
      </QueryClientProvider>
    )
  }

  return render(<EventAnalyticsLeadsTimeline />, { wrapper: Wrapper })
}

describe('EventAnalyticsLeadsTimeline', () => {
  beforeEach(() => {
    vi.mocked(apiProxy.get).mockReset()
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      bottom: 320,
      height: 320,
      left: 0,
      right: 800,
      top: 0,
      width: 800,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows a zero-to-five Y-axis when the timeline has no data points', async () => {
    vi.mocked(apiProxy.get).mockResolvedValue({
      data: { data: { points: [] } },
    })

    const { container } = renderTimeline()

    await waitFor(() => {
      expect(container.querySelector('[data-slot="chart"]')).toBeInTheDocument()
    })
    expect(
      screen.getAllByText('5').some((tick) => tick.getAttribute('aria-hidden') !== 'true'),
    ).toBe(true)
  })
})
