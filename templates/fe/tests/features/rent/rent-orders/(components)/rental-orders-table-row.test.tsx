import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import RentalOrdersTableRow from '@/features/rent/rent-orders/(components)/rental-orders-table-row'
import type { RentalOrder } from '@/features/rent/rent-orders/(helpers)/rental-order-map'
import messages from '@/messages/en.json'
import { PERMISSIONS, PERMISSION_ALL_WILDCARD } from '@/shared/constants/permissions'
import { useUserStore } from '@/shared/stores/use-user-store'

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, ...props }: React.ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...props} />
  ),
}))

const baseOrder: RentalOrder = {
  id: 'order-1',
  recipientName: 'Alex Example',
  totalAmount: 120,
  status: 'pending',
  startTime: '2026-09-07 12:00:00',
  endTime: '2026-09-10 12:00:00',
}

function renderRow(order: RentalOrder = baseOrder) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <table>
        <tbody>
          <RentalOrdersTableRow order={order} />
        </tbody>
      </table>
    </NextIntlClientProvider>,
  )
}

describe('RentalOrdersTableRow actions', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-27T00:00:00.000Z'))
    useUserStore.setState({ permissions: [] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows disabled Edit and Cancel buttons to a wildcard administrator', () => {
    useUserStore.setState({ permissions: [PERMISSION_ALL_WILDCARD] })

    renderRow()

    const editButton = screen.getByRole('button', { name: 'Edit' })
    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    expect(editButton).toBeDisabled()
    expect(editButton).toHaveAttribute('data-variant', 'outline')
    expect(cancelButton).toBeDisabled()
    expect(cancelButton).toHaveAttribute('data-variant', 'default')
  })

  it('shows only the disabled Edit button to an event manager', () => {
    useUserStore.setState({ permissions: [PERMISSIONS.Event.Management] })

    renderRow()

    expect(screen.getByRole('button', { name: 'Edit' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
  })

  it('hides both actions from users without action permissions', () => {
    renderRow()

    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
  })

  it.each(['complete', 'canceled'] as const)(
    'uses the outline Cancel variant for a %s order',
    (status) => {
      useUserStore.setState({ permissions: [PERMISSION_ALL_WILDCARD] })

      renderRow({ ...baseOrder, status })

      expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute(
        'data-variant',
        'outline',
      )
    },
  )

  it('uses the outline Cancel variant when the start time is not more than 10 days away', () => {
    useUserStore.setState({ permissions: [PERMISSION_ALL_WILDCARD] })

    renderRow({ ...baseOrder, startTime: '2026-09-06 00:00:00' })

    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute(
      'data-variant',
      'outline',
    )
  })
})
