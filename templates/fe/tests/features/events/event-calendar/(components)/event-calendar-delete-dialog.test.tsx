import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import { describe, expect, it, vi } from 'vitest'

import { EventCalendarDeleteDialog } from '@/features/events/event-calendar/(components)/event-calendar-delete-dialog'
import type { CalendarEvent } from '@/features/events/event-calendar/(hooks)/use-event-calendar-data'
import messages from '@/messages/en.json'

const EVENT: CalendarEvent = {
  id: 'event-1',
  title: 'Munich Product Launch',
  status: 'ACTIVE',
  startDate: '2026-09-16T15:00:00Z',
  endDate: '2026-09-16T17:00:00Z',
  step: 1,
  type: 'Launch',
}

function renderDialog(event: CalendarEvent | null = EVENT, props: Partial<React.ComponentProps<typeof EventCalendarDeleteDialog>> = {}) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <EventCalendarDeleteDialog event={event} onClose={vi.fn()} onConfirm={vi.fn()} {...props} />
    </NextIntlClientProvider>,
  )
}

describe('EventCalendarDeleteDialog', () => {
  it('does not render when there is no event to delete', () => {
    renderDialog(null)

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('shows the "Move to trash?" confirmation with Cancel and Confirm actions', () => {
    renderDialog()

    expect(screen.getByText('Move to trash')).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to move this event to trash?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
  })

  it('closes without deleting when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    renderDialog(EVENT, { onClose, onConfirm })

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('calls onConfirm with the event when Confirm is clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    renderDialog(EVENT, { onConfirm })

    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(onConfirm).toHaveBeenCalledWith(EVENT)
  })
})
