import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NextIntlClientProvider } from 'next-intl'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import EventOverviewActivities from '@/features/reporting-tool/event-overview/(components)/event-overview-activities'
import { apiProxy } from '@/lib/api'
import messages from '@/messages/de.json'

vi.mock('@/lib/api', () => ({
  apiProxy: { get: vi.fn() },
}))

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({ children }: { children: ReactNode }) => <button type="button">{children}</button>,
}))

function renderActivities() {
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

  return render(<EventOverviewActivities />, { wrapper: Wrapper })
}

describe('EventOverviewActivities', () => {
  beforeEach(() => {
    vi.mocked(apiProxy.get).mockReset()
  })

  it('uses the actor name for the activity avatar initials', async () => {
    vi.mocked(apiProxy.get).mockResolvedValue({
      data: {
        data: {
          items: [{
            id: 'activity-1',
            type: 'LEAD_CREATED',
            createdAt: '2026-08-20T10:00:00Z',
            metadata: null,
            actor: { id: 'actor-1', name: 'Tu Anh' },
            lead: { company: 'CCEP', fullName: 'Max Mustermann', email: null },
            survey: { id: 'survey-1', name: 'Feedback' },
          }],
          pagination: { page: 1, limit: 5, total: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false },
        },
      },
    })

    renderActivities()

    expect(await screen.findByText('TA')).toBeInTheDocument()
    expect(screen.queryByText('LC')).not.toBeInTheDocument()
  })
})
