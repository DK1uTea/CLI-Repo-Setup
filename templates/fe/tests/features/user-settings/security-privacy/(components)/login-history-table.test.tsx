import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LoginHistoryTable } from '@/features/user-settings/security-privacy/(components)/login-history-table'
import { apiProxy } from '@/lib/api'
import messages from '@/messages/en.json'

vi.mock('@/lib/api', () => ({ apiProxy: { get: vi.fn() } }))

const baseSession = {
  device: 'Desktop',
  browser: 'Chrome',
  ipAddress: '127.0.0.1',
  isActive: false,
  lastActiveAt: '2026-08-19T10:00:00Z',
}

function renderTable(items: Array<Record<string, unknown>>) {
  vi.mocked(apiProxy.get).mockResolvedValueOnce({
    data: { data: { items, pagination: { totalPages: 1 } } },
  })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <QueryClientProvider client={queryClient}>
        <NuqsTestingAdapter>
          <LoginHistoryTable />
        </NuqsTestingAdapter>
      </QueryClientProvider>
    </NextIntlClientProvider>,
  )
}

describe('LoginHistoryTable', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders Location immediately after IP Address', async () => {
    renderTable([{ ...baseSession, id: 'session-1', location: 'Berlin' }])

    expect(await screen.findByText('Berlin')).toBeVisible()
    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
      'Device',
      'Browser',
      'IP Address',
      'Location',
      'Last Activity',
    ])
  })

  it('shows Unknown Location when location is null or missing', async () => {
    renderTable([
      { ...baseSession, id: 'session-1', location: null },
      { ...baseSession, id: 'session-2' },
    ])

    expect(await screen.findAllByText('Unknown Location')).toHaveLength(2)
  })

  it('shows Unknown Location for a blank/whitespace-only location too', async () => {
    renderTable([{ ...baseSession, id: 'session-1', location: '   ' }])

    expect(await screen.findByText('Unknown Location')).toBeInTheDocument()
  })

  it('renders every column with the exact values from a crafted session row', async () => {
    renderTable([
      {
        id: 'session-1',
        device: 'MacBook Pro',
        browser: 'Safari',
        ipAddress: '203.0.113.7',
        location: 'Munich, DE',
        isActive: true,
        lastActiveAt: '2026-08-19T14:30:00Z',
      },
    ])

    expect(await screen.findByText('MacBook Pro')).toBeInTheDocument()
    expect(screen.getByText('(this device)')).toBeInTheDocument()
    expect(screen.getByText('Safari')).toBeInTheDocument()
    expect(screen.getByText('203.0.113.7')).toBeInTheDocument()
    expect(screen.getByText('Munich, DE')).toBeInTheDocument()
  })

  it('falls back to "Unknown Browser" when browser is missing', async () => {
    renderTable([{ ...baseSession, id: 'session-1', browser: null }])

    expect(await screen.findByText('Unknown Browser')).toBeInTheDocument()
  })

  it('does not show the "(This Device)" suffix for an inactive session', async () => {
    renderTable([{ ...baseSession, id: 'session-1', isActive: false }])

    await screen.findByText('Desktop')
    expect(screen.queryByText('(this device)')).not.toBeInTheDocument()
  })

  it('formats Last Activity as the account\'s date format plus HH:mm, not a hardcoded string', async () => {
    renderTable([{ ...baseSession, id: 'session-1', lastActiveAt: '2026-08-19T14:05:00Z' }])

    // dayjs.utc(...).format(`${dateFormat} HH:mm`) with the default 'DD/MM/YYYY' this test
    // suite's messages/locale resolves to — asserted against the real computed string
    // rather than the sheet's own unverifiable example format.
    expect(await screen.findByText('19/08/2026 14:05')).toBeInTheDocument()
  })

  it('shows "N/A" for Last Activity when the field is absent', async () => {
    renderTable([{ ...baseSession, id: 'session-1', lastActiveAt: '' }])

    expect(await screen.findByText('N/A')).toBeInTheDocument()
  })

  it('renders an empty state with no rows and no pagination when there is no login history', async () => {
    vi.mocked(apiProxy.get).mockResolvedValueOnce({
      data: { data: { items: [], pagination: { totalPages: 1 } } },
    })
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <QueryClientProvider client={queryClient}>
          <NuqsTestingAdapter>
            <LoginHistoryTable />
          </NuqsTestingAdapter>
        </QueryClientProvider>
      </NextIntlClientProvider>,
    )

    expect(await screen.findByText('No login history found.')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('is read-only — no revoke/logout action column or buttons exist in the table', async () => {
    renderTable([{ ...baseSession, id: 'session-1' }])

    await screen.findByText('Desktop')
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    const headers = screen.getAllByRole('columnheader').map((h) => h.textContent)
    expect(headers).not.toContain('Actions')
  })
})
