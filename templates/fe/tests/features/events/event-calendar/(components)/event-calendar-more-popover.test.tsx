import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { EventCalendarMorePopover } from '@/features/events/event-calendar/(components)/event-calendar-more-popover'
import type { CalendarEvent } from '@/features/events/event-calendar/(hooks)/use-event-calendar-data'

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
}))

vi.mock('@floating-ui/react-dom', () => ({
  useFloating: () => ({ refs: { setFloating: vi.fn(), floating: { current: null } }, floatingStyles: {} }),
  autoUpdate: vi.fn(),
  flip: vi.fn(),
  shift: vi.fn(),
  offset: vi.fn(),
}))

const EVENTS: CalendarEvent[] = [
  { id: 'event-1', title: 'Product Launch', status: 'ACTIVE', startDate: '2026-09-16T09:00:00Z', endDate: '2026-09-16T10:00:00Z', step: 1, type: 'Launch' },
  { id: 'event-2', title: 'Team Sync', status: 'ACTIVE', startDate: '2026-09-16T11:00:00Z', endDate: '2026-09-16T12:00:00Z', step: 1, type: 'Meeting' },
]

function renderPopover(overrides: Partial<Parameters<typeof EventCalendarMorePopover>[0]> = {}) {
  const anchorEl = document.createElement('button')
  document.body.appendChild(anchorEl)
  return render(
    <EventCalendarMorePopover
      date={new Date('2026-09-16T00:00:00Z')}
      events={EVENTS}
      anchorEl={anchorEl}
      onClose={vi.fn()}
      onSelectEvent={vi.fn()}
      {...overrides}
    />,
  )
}

describe('EventCalendarMorePopover', () => {
  it('shows the day as its header and lists every event for that day', () => {
    renderPopover()

    expect(screen.getByText('16 September 2026')).toBeInTheDocument()
    expect(screen.getByText('Product Launch')).toBeInTheDocument()
    expect(screen.getByText('Team Sync')).toBeInTheDocument()
  })

  it('opens the event detail when an event in the list is clicked', async () => {
    const user = userEvent.setup()
    const onSelectEvent = vi.fn()
    const onClose = vi.fn()
    renderPopover({ onSelectEvent, onClose })

    await user.click(screen.getByText('Product Launch'))

    expect(onSelectEvent).toHaveBeenCalledWith(EVENTS[0])
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes the popover when the X button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderPopover({ onClose })

    // Rendered via createPortal into document.body, not into RTL's default container.
    const closeButton = document.body.querySelector('.lucide-x')?.closest('button')
    expect(closeButton).toBeTruthy()
    await user.click(closeButton!)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // Accessibility rule (CLAUDE.md): "Icon-only buttons need aria-label". The close button
  // here is icon-only with no accessible name — event-calendar-more-popover.tsx:58-64 has
  // no aria-label, so getByRole('button', { name: /close/i }) cannot find it.
  it.fails('gives the icon-only close button an accessible name', () => {
    renderPopover()

    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('closes the popover on Escape', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderPopover({ onClose })

    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
