import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import DashboardEvents from '@/features/dashboard/(components)/dashboard-events'
import deMessages from '@/messages/de.json'

/**
 * Test-case source: Dashboard test case sheet — "Your Upcoming Events" and
 * "Upcoming Team Events" sections (empty state, per-event info, deadline-only-on-mine).
 */

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, ...props }: React.ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...props} />
  ),
}))

const mocks = vi.hoisted(() => ({
  events: {
    myEvents: [] as Array<{ id: string; name: string; startDate: string; eventTypeName?: string; createdBy?: string }>,
    teamEvents: [] as Array<{ id: string; name: string; startDate: string; eventTypeName?: string; createdBy?: string }>,
    isLoading: false,
  },
}))

vi.mock('@/features/dashboard/(hooks)/use-dashboard-events', () => ({
  useDashboardEvents: () => mocks.events,
}))

function renderEvents() {
  return render(
    <NextIntlClientProvider locale="de" messages={deMessages}>
      <DashboardEvents />
    </NextIntlClientProvider>,
  )
}

describe('DashboardEvents', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-28T12:00:00.000Z'))
    mocks.events.myEvents = []
    mocks.events.teamEvents = []
    mocks.events.isLoading = false
  })

  it('shows the empty state for Your Upcoming Events when there are no personal events', () => {
    renderEvents()

    expect(screen.getByText('Keine bevorstehenden Events')).toBeInTheDocument()
    expect(
      screen.getByText('Sie haben keine Events in naher Zukunft geplant.'),
    ).toBeInTheDocument()
  })

  it('shows the empty state for Upcoming Team Events when there are no team events', () => {
    renderEvents()

    expect(screen.getByText('Keine Team-Events')).toBeInTheDocument()
    expect(screen.getByText('Ihr Team hat keine bevorstehenden Events.')).toBeInTheDocument()
  })

  it('renders a personal event with its name, type badge, and the deadline reminder', () => {
    mocks.events.myEvents = [
      {
        id: 'evt-1',
        name: 'Annual Congress',
        startDate: '2026-09-03T09:00:00.000Z',
        eventTypeName: 'Congress',
      },
    ]

    renderEvents()

    expect(screen.getByText('Annual Congress')).toBeInTheDocument()
    expect(screen.getByText('Congress')).toBeInTheDocument()
    expect(screen.getByText('Fällig in 6 Tagen')).toBeInTheDocument()
  })

  it('renders a team event with "Organized by" but never a deadline reminder, even within 10 days', () => {
    mocks.events.teamEvents = [
      {
        id: 'evt-2',
        name: 'Team Kickoff',
        startDate: '2026-09-01T09:00:00.000Z',
        createdBy: 'Max Mustermann',
      },
    ]

    renderEvents()

    expect(screen.getByText('Team Kickoff')).toBeInTheDocument()
    expect(screen.getByText('Organisiert von Max Mustermann')).toBeInTheDocument()
    expect(screen.queryByText(/Fällig in/)).not.toBeInTheDocument()
  })

  it('shows loading skeletons for both lists while events are loading', () => {
    mocks.events.isLoading = true

    const { container } = renderEvents()

    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(6)
    expect(screen.queryByText('Keine bevorstehenden Events')).not.toBeInTheDocument()
  })
})
