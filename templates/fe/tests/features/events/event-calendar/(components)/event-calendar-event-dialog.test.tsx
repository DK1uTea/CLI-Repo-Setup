import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import { describe, expect, it, vi } from 'vitest'

import { EventCalendarEventDialog } from '@/features/events/event-calendar/(components)/event-calendar-event-dialog'
import type { CalendarEvent } from '@/features/events/event-calendar/(hooks)/use-event-calendar-data'
import messages from '@/messages/en.json'

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, ...props }: React.ComponentProps<'a'> & { href: string }) => <a href={href} {...props} />,
}))

const EVENT: CalendarEvent = {
  id: 'event-1',
  title: 'Munich Product Launch',
  status: 'ACTIVE',
  startDate: '2026-09-16T15:00:00Z',
  endDate: '2026-09-16T17:00:00Z',
  step: 1,
  type: 'Launch',
  city: 'Munich',
  address: 'Marienplatz 1',
  description: 'A short description of the event.',
  adminContact: { name: 'Max Mustermann', email: 'max@example.com' },
  isOwner: true,
}

function renderDialog(overrides: Partial<CalendarEvent> | null = {}, props: Partial<React.ComponentProps<typeof EventCalendarEventDialog>> = {}) {
  const event = overrides === null ? null : { ...EVENT, ...overrides }
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <EventCalendarEventDialog event={event} onClose={vi.fn()} onDeleteClickAction={vi.fn()} {...props} />
    </NextIntlClientProvider>,
  )
}

describe('EventCalendarEventDialog', () => {
  it('does not render when there is no selected event', () => {
    renderDialog(null)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows the title, date/time range, location, guests, and description', () => {
    renderDialog()

    expect(screen.getByText('Munich Product Launch')).toBeInTheDocument()
    expect(screen.getByText(/Wednesday, September 16 · 15:00 – Wednesday, September 16 · 17:00/)).toBeInTheDocument()
    expect(screen.getByText('Munich')).toBeInTheDocument()
    expect(screen.getByText('Marienplatz 1')).toBeInTheDocument()
    expect(screen.getByText('Max Mustermann')).toBeInTheDocument()
    expect(screen.getByText('max@example.com')).toBeInTheDocument()
    expect(screen.getByText('A short description of the event.')).toBeInTheDocument()
  })

  it('renders an HTML description as real formatting, not literal tag text', () => {
    renderDialog({ description: '<p>Rich <strong>text</strong> description</p>' })

    expect(screen.getByText('text', { selector: 'strong' })).toBeInTheDocument()
    expect(screen.queryByText(/<p>|<strong>/)).not.toBeInTheDocument()
  })

  it('hides the location block when the event has no city', () => {
    renderDialog({ city: undefined, address: undefined })

    expect(screen.queryByText('Marienplatz 1')).not.toBeInTheDocument()
  })

  it('hides the guests block when the event has no admin contact', () => {
    renderDialog({ adminContact: undefined })

    expect(screen.queryByText('Max Mustermann')).not.toBeInTheDocument()
  })

  it('closes the dialog via the close (X) button', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderDialog({}, { onClose })

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows Delete only when the current user owns the event', () => {
    renderDialog({ isOwner: true })
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('hides Delete for an event the current user does not own', () => {
    renderDialog({ isOwner: false })
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })

  it('calls onDeleteClickAction with the event when Delete is clicked', async () => {
    const user = userEvent.setup()
    const onDeleteClickAction = vi.fn()
    renderDialog({ isOwner: true }, { onDeleteClickAction })

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(onDeleteClickAction).toHaveBeenCalledWith(expect.objectContaining({ id: 'event-1' }))
  })

  it('links Edit to the event\'s update page', () => {
    renderDialog()

    expect(screen.getByRole('link', { name: /Edit/ })).toHaveAttribute(
      'href',
      '/events/update-event?eventId=event-1',
    )
  })
})
