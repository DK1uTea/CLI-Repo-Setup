import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NextIntlClientProvider } from 'next-intl'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import EventOverviewStats from '@/features/reporting-tool/event-overview/(components)/event-overview-stats'
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

  return render(<EventOverviewStats />, { wrapper: Wrapper })
}

describe('EventOverviewStats change percentages', () => {
  beforeEach(() => {
    vi.mocked(apiProxy.get).mockReset()
  })

  it('shows a plus sign for zero and positive changes while preserving negative changes', async () => {
    vi.mocked(apiProxy.get).mockResolvedValue({
      data: {
        data: {
          totalLeads: 100,
          leadsToday: 20,
          leadsLastMonth: 80,
          activeUsers: 10,
          totalLeadsChangePercent: -4,
          leadsTodayChangePercent: 0,
          leadsLastMonthChangePercent: 3,
          activeUsersChangePercent: 7,
        },
      },
    })

    renderStats()

    expect(await screen.findByText('-4%')).toBeInTheDocument()
    expect(screen.getByText('+0%')).toBeInTheDocument()
    expect(screen.getByText('+3%')).toBeInTheDocument()
  })

  it('formats large stat values using the active locale', async () => {
    vi.mocked(apiProxy.get).mockResolvedValue({
      data: {
        data: {
          totalLeads: 1234,
          leadsToday: 0,
          leadsLastMonth: 0,
          activeUsers: 0,
          totalLeadsChangePercent: 0,
          leadsTodayChangePercent: 0,
          leadsLastMonthChangePercent: 0,
          activeUsersChangePercent: 0,
        },
      },
    })

    renderStats()

    expect(await screen.findByText('1.234')).toBeInTheDocument()
    expect(screen.getAllByText('0')).toHaveLength(3)
  })
})
