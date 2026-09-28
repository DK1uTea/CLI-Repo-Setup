import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import messages from '@/messages/en.json'
import { EventListItem } from '@/features/events/event-list/(components)/event-list-item'
import type { EventItem } from '@/features/events/event-list/(hooks)/use-event-list-data'
import { PERMISSIONS, PERMISSION_ALL_WILDCARD } from '@/shared/constants/permissions'
import { useUserStore } from '@/shared/stores/use-user-store'

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, ...props }: React.ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...props} />
  ),
  usePathname: () => '/events',
}))

vi.mock('@/features/events/event-list/(hooks)/use-event-filter-config', () => ({
  useEventFilterConfig: () => ({ data: { eventTypeId: [] } }),
}))

const event: EventItem = {
  id: 'event-1',
  title: 'Launch event',
  status: 'ACTIVE',
  startDate: '2026-08-20T00:00:00.000Z',
  endDate: '2026-08-21T00:00:00.000Z',
  step: 1,
  type: 'Launch',
  isOwner: true,
}

function renderItem(item: EventItem = event, onDelete = vi.fn()) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <EventListItem event={item} onDeleteClickAction={onDelete} />
    </NextIntlClientProvider>,
  )
}

describe('EventListItem actions', () => {
  beforeEach(() => {
    useUserStore.setState({ permissions: [] })
  })

  it('keeps the mobile option menu in the same primary row as the event details', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    renderItem(event, onDelete)

    const detailLink = screen.getByRole('link', { name: /Launch event/ })
    expect(screen.getByRole('link', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()

    const menuTrigger = screen.getByRole('button', { name: 'More options' })
    expect(menuTrigger.parentElement).toBe(detailLink.parentElement)
    await user.click(menuTrigger)

    const menu = screen.getByRole('menu')
    const editOption = within(menu).getByRole('menuitem', { name: 'Edit' })
    const deleteOption = within(menu).getByRole('menuitem', { name: 'Delete' })

    expect(editOption).toHaveAttribute('href', '/events/update-event?eventId=event-1')
    expect(editOption.querySelector('.lucide-pencil')).toBeInTheDocument()
    expect(deleteOption.querySelector('.lucide-trash-2')).toBeInTheDocument()

    await user.click(deleteOption)
    expect(onDelete).toHaveBeenCalledWith(event)
  })

  it('does not offer delete to a non-owner', async () => {
    const user = userEvent.setup()
    renderItem({ ...event, isOwner: false })

    await user.click(screen.getByRole('button', { name: 'More options' }))

    expect(screen.queryByRole('menuitem', { name: 'Delete' })).not.toBeInTheDocument()
  })

  it.each([
    ['a wildcard administrator', [PERMISSION_ALL_WILDCARD]],
    ['an event manager with delete permission', [PERMISSIONS.Event.Delete]],
  ])('offers delete to %s even when they are not the owner', async (_role, permissions) => {
    const user = userEvent.setup()
    useUserStore.setState({ permissions })
    renderItem({ ...event, isOwner: false })

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'More options' }))

    expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument()
  })

  // testcase/event-navigator/list-event-navigator.md case 16: "Khôi phục event từ Delete
  // list — Lọc Status=Deleted -> chọn event -> Restore -> Event được khôi phục, trở lại
  // Active." Currently EventListItem hides its entire action row (both the desktop
  // Edit/Delete buttons and the mobile OptionMenu) whenever status is DELETED
  // (event-list-item.tsx:97,120) — there is no Restore action anywhere in the component,
  // and no restore API call exists in the codebase at all. This is expected to fail until
  // a Restore action and its backing API call are implemented.
  it.fails('offers a Restore action for a deleted event instead of hiding every action', async () => {
    const onRestore = vi.fn()
    // @ts-expect-error — onRestoreClickAction does not exist yet; remove this suppression
    // once the Restore action (case 16) is implemented.
    const deletedItem = <EventListItem event={{ ...event, status: 'DELETED' }} onRestoreClickAction={onRestore} />
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        {deletedItem}
      </NextIntlClientProvider>,
    )

    expect(screen.getByRole('button', { name: 'Restore' })).toBeInTheDocument()
  })
})
