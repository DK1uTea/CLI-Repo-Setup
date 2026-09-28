import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { EventListTargetAudienceFilter } from '@/features/events/event-list/(components)/event-list-target-audience-filter'
import { apiProxy } from '@/lib/api'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('@/lib/api', () => ({ apiProxy: { get: vi.fn() } }))

const TARGET_AUDIENCE_CONFIG = {
  status: [],
  timeFrame: [],
  eventTypeId: [],
  partnershipTypes: [],
  createdBy: [],
  targetAudience: [
    { value: 'CONSUMER', label: 'Consumer' },
    { value: 'HANDEL', label: 'Handel' },
  ],
}

function renderFilter() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <NuqsTestingAdapter hasMemory>
        <EventListTargetAudienceFilter />
      </NuqsTestingAdapter>
    </QueryClientProvider>,
  )
}

describe('EventListTargetAudienceFilter', () => {
  beforeEach(() => {
    vi.mocked(apiProxy.get).mockResolvedValue({ data: { data: TARGET_AUDIENCE_CONFIG } })
  })

  it('applies a single selected target audience to the URL', async () => {
    const user = userEvent.setup()
    renderFilter()

    await user.click(await screen.findByRole('button', { name: 'filterTargetAudience' }))
    await user.click(screen.getByRole('button', { name: 'Consumer' }))
    await user.click(screen.getByRole('button', { name: 'apply' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'filterTargetAudience' }).className).toMatch(/border-primary/))
  })

  it('applies multiple selected targets together (AND), not just the last one', async () => {
    const user = userEvent.setup()
    renderFilter()

    await user.click(await screen.findByRole('button', { name: 'filterTargetAudience' }))
    await user.click(screen.getByRole('button', { name: 'Consumer' }))
    await user.click(screen.getByRole('button', { name: 'Handel' }))

    expect(screen.getByRole('button', { name: 'Consumer' }).className).toMatch(/bg-primary/)
    expect(screen.getByRole('button', { name: 'Handel' }).className).toMatch(/bg-primary/)
  })

  it('clears the selection and the applied URL filter when Reset is clicked', async () => {
    const user = userEvent.setup()
    renderFilter()

    await user.click(await screen.findByRole('button', { name: 'filterTargetAudience' }))
    await user.click(screen.getByRole('button', { name: 'Consumer' }))
    await user.click(screen.getByRole('button', { name: 'apply' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'filterTargetAudience' }).className).toMatch(/border-primary/))

    await user.click(screen.getByRole('button', { name: 'filterTargetAudience' }))
    await user.click(screen.getByRole('button', { name: 'reset' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'filterTargetAudience' }).className).not.toMatch(/border-primary/))
  })

  it('discards an unapplied selection when the dropdown is reopened without clicking Apply', async () => {
    const user = userEvent.setup()
    renderFilter()

    await user.click(await screen.findByRole('button', { name: 'filterTargetAudience' }))
    await user.click(screen.getByRole('button', { name: 'Consumer' }))
    await user.keyboard('{Escape}')

    await user.click(screen.getByRole('button', { name: 'filterTargetAudience' }))
    expect(screen.getByRole('button', { name: 'Consumer' }).className).not.toMatch(/bg-primary/)
  })
})
