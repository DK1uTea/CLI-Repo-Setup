import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import messages from '@/messages/en.json'
import { CalendarListItem } from '@/features/calendar/calendar-list/(components)/calendar-list-item'
import type { CalendarEventItem } from '@/features/calendar/calendar-list/(hooks)/use-calendar-list-data'

const { permissionState } = vi.hoisted(() => ({
  permissionState: {
    wildcard: false,
    canUpdate: true,
    canDelete: false,
  },
}))

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, ...props }: React.ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...props} />
  ),
}))

vi.mock('@/shared/stores/use-user-store', () => ({
  useDateFormat: () => 'DD.MM.YYYY',
  useHasPermission: (key: string) => {
    if (key === '*') return permissionState.wildcard
    if (key === 'event-calendar.update') return permissionState.canUpdate
    if (key === 'event-calendar.delete') return permissionState.canDelete
    return false
  },
}))

vi.mock('@/features/events/event-list/(hooks)/use-event-filter-config', () => ({
  useEventFilterConfig: () => ({ data: { eventTypeId: [] } }),
}))

const event: CalendarEventItem = {
  id: 'calendar-1',
  title: 'Calendar launch',
  type: 'Launch',
  status: 'ACTIVE',
  startDate: '2026-08-20T00:00:00.000Z',
  endDate: '2026-08-21T00:00:00.000Z',
  isOwner: true,
}

describe('CalendarListItem actions', () => {
  beforeEach(() => {
    permissionState.wildcard = false
    permissionState.canUpdate = true
    permissionState.canDelete = false
  })

  it('keeps the mobile edit menu in the same primary row as the calendar details', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <CalendarListItem event={event} onDeleteClickAction={onDelete} />
      </NextIntlClientProvider>,
    )

    const detailLink = screen.getByRole('link', { name: /Calendar launch/ })
    const menuTrigger = screen.getByRole('button', { name: 'More options' })
    expect(menuTrigger.parentElement).toBe(detailLink.parentElement)

    await user.click(menuTrigger)

    const editOption = within(screen.getByRole('menu')).getByRole('menuitem', { name: 'Edit' })
    expect(editOption).toHaveAttribute(
      'href',
      '/calendar-dashboard/update-calendar-event?eventId=calendar-1',
    )
    expect(editOption.querySelector('.lucide-pencil')).toBeInTheDocument()

    const deleteOption = within(screen.getByRole('menu')).getByRole('menuitem', {
      name: 'Delete',
    })
    expect(deleteOption.querySelector('.lucide-trash-2')).toBeInTheDocument()

    await user.click(deleteOption)
    expect(onDelete).toHaveBeenCalledWith(event)
  })

  it('offers delete to a non-owner with Calendar.Delete permission', async () => {
    const user = userEvent.setup()
    permissionState.canUpdate = false
    permissionState.canDelete = true
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <CalendarListItem event={{ ...event, isOwner: false }} />
      </NextIntlClientProvider>,
    )

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Edit' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'More options' }))

    expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'Edit' })).not.toBeInTheDocument()
  })
})
