import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { NotificationBell } from '@/features/cam/notification/(components)/notification-bell'
import type { NotificationItem } from '@/features/cam/notification/(hooks)/use-notification-list'

const mocks = vi.hoisted(() => ({
  onSseMessage: undefined as ((event: MessageEvent) => void) | undefined,
}))

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => key,
}))

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/shared/stores/use-user-store', () => ({
  useUserStore: () => null,
  useHasPermission: () => false,
}))

vi.mock('@/shared/components/ui/popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/features/cam/notification/(hooks)/use-notification-actions', () => ({
  useMarkNotificationRead: () => ({ mutate: vi.fn() }),
  useMarkAllNotificationsRead: () => ({ mutate: vi.fn() }),
}))

vi.mock('@/features/cam/notification/(hooks)/use-notification-list', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('@/features/cam/notification/(hooks)/use-notification-list')>()

  const existing: NotificationItem = {
    id: 'notification-a',
    type: 'CHAT_MESSAGE',
    action: 'message',
    occurrenceCount: 1,
    time: 'old time',
    read: false,
    activationId: 'activation-1',
  }

  return {
    ...original,
    useNotificationList: () => ({
      notifications: [existing],
      hasNextPage: false,
      loadMore: vi.fn(),
      isFetching: false,
    }),
  }
})

vi.mock('@/features/cam/notification/(hooks)/use-notification-sse', () => ({
  useNotificationSse: ({ onMessage }: { onMessage: (event: MessageEvent) => void }) => {
    mocks.onSseMessage = onMessage
  },
}))

vi.mock('@/features/cam/notification/(components)/notification-panel', () => ({
  NotificationPanel: ({ notifications }: { notifications: NotificationItem[] }) => (
    <output>
      {notifications.map((notification) => (
        <span key={notification.id}>
          {notification.id}:{notification.occurrenceCount}
        </span>
      ))}
    </output>
  ),
}))

describe('NotificationBell', () => {
  it('updates an existing notification when SSE sends the same id with a newer count', () => {
    render(<NotificationBell />)

    expect(screen.getByText('notification-a:1')).toBeInTheDocument()

    act(() => {
      mocks.onSseMessage?.(
        new MessageEvent('message', {
          data: JSON.stringify({
            id: 'notification-a',
            type: 'CHAT_MESSAGE',
            status: 'unread',
            referenceId: 'activation-1',
            referenceType: 'ACTIVATION',
            updatedAt: '2026-07-31T10:00:00Z',
            metadata: { occurrenceCount: 2 },
          }),
        }),
      )
    })

    expect(screen.getByText('notification-a:2')).toBeInTheDocument()
    expect(screen.queryByText('notification-a:1')).not.toBeInTheDocument()
  })
})
