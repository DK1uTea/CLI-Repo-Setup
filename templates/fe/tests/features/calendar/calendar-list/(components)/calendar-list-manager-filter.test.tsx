import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { describe, expect, it, vi } from 'vitest'

import { apiProxy } from '@/lib/api'
import { CalendarListManagerFilter } from '@/features/calendar/calendar-list/(components)/calendar-list-manager-filter'
import messages from '@/messages/en.json'

vi.mock('@/lib/api', () => ({ apiProxy: { get: vi.fn() } }))

describe('CalendarListManagerFilter', () => {
  it('loads manager choices from the ownership-transfer candidates endpoint when opened', async () => {
    const user = userEvent.setup()
    vi.mocked(apiProxy.get).mockImplementation(async (url) => {
      if (url === 'etr/users/ownership-transfer-candidates') {
        return {
          data: {
            data: {
              items: [{ id: 'user-1', name: 'Alex Manager', email: 'alex@example.com' }],
              pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNextPage: false },
            },
          },
        }
      }

      return { data: { data: { createdBy: [{ value: 'old-user', label: 'Old Manager' }] } } }
    })

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <QueryClientProvider client={queryClient}>
        <NextIntlClientProvider locale="en" messages={messages}>
          <NuqsTestingAdapter>
            <CalendarListManagerFilter />
          </NuqsTestingAdapter>
        </NextIntlClientProvider>
      </QueryClientProvider>,
    )

    await user.click(screen.getByRole('button', { name: /event manager/i }))

    expect(await screen.findByRole('button', { name: 'Alex Manager' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Old Manager' })).not.toBeInTheDocument()
    await waitFor(() => {
      expect(apiProxy.get).toHaveBeenCalledWith('etr/users/ownership-transfer-candidates', {
        params: { page: 1, limit: 10, search: undefined },
      })
    })
  })
})
