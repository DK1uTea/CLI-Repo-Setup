import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NextIntlClientProvider } from 'next-intl'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import EventAnalyticsStats from '@/features/reporting-tool/event-analytics/(components)/event-analytics-stats'
import { apiProxy } from '@/lib/api'
import messages from '@/messages/de.json'

vi.mock('@/lib/api', () => ({
  apiProxy: { get: vi.fn() },
}))

function renderStats() {
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

  return render(<EventAnalyticsStats />, { wrapper: Wrapper })
}

describe('EventAnalyticsStats change percentages', () => {
  beforeEach(() => {
    vi.mocked(apiProxy.get).mockReset()
  })

  it('shows a plus sign for zero and positive changes while preserving negative changes', async () => {
    vi.mocked(apiProxy.get).mockResolvedValue({
      data: {
        data: {
          totalLeads: 100,
          totalLeadsYesterday: 90,
          totalLeadsChangePercent: -4,
          newLeads: 20,
          newLeadsLastHour: 20,
          newLeadsChangePercent: 0,
          existingLeads: 80,
          existingLeadsYesterday: 77,
          existingLeadsChangePercent: 3,
          leadsToday: 10,
          leadsYesterday: 3,
          leadsTodayChangePercent: 7,
        },
      },
    })

    renderStats()

    expect(await screen.findByText('-4%')).toBeInTheDocument()
    expect(screen.getByText('+0%')).toBeInTheDocument()
    expect(screen.getByText('+3%')).toBeInTheDocument()
  })
})
