import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CalendarEventDetailHeader } from '@/features/calendar/event-calendar-detail/(components)/calendar-event-detail-header'
import type { CalendarEventDetail } from '@/features/calendar/event-calendar-detail/(hooks)/use-calendar-event-detail'

const { permissionState } = vi.hoisted(() => ({ permissionState: { isWildcardAdmin: false } }))

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('@/shared/stores/use-user-store', () => ({
  useHasPermission: () => permissionState.isWildcardAdmin,
}))
vi.mock('@/shared/components/common/component-guard', () => ({
  ComponentGuard: () => null,
}))
vi.mock('@/shared/components/ui/button', () => ({
  Button: ({ children, href, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: string }) => (
    <button {...props}>{children}</button>
  ),
}))
vi.mock('@/features/events/event-form/(hooks)/use-duplicate-event', () => ({
  useDuplicateEvent: () => ({ duplicate: vi.fn(), isPending: false }),
}))

const EVENT = { id: 'event-1', isOwner: true } as CalendarEventDetail

beforeEach(() => {
  permissionState.isWildcardAdmin = false
})

describe('CalendarEventDetailHeader', () => {
  it('hides Transfer Event from an owner who is not a wildcard admin', () => {
    render(<CalendarEventDetailHeader event={EVENT} onTransfer={vi.fn()} />)

    expect(screen.queryByRole('button', { name: 'transferEvent' })).not.toBeInTheDocument()
  })

  it('shows Transfer Event to a wildcard admin without requiring a component permission', () => {
    permissionState.isWildcardAdmin = true

    render(<CalendarEventDetailHeader event={EVENT} onTransfer={vi.fn()} />)

    const transferButton = screen.getByRole('button', { name: 'transferEvent' })
    expect(transferButton).toBeInTheDocument()
    expect(transferButton.closest('[data-slot="card"]')).toBeInTheDocument()
  })
})
