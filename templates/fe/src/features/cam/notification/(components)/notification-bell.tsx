'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { BellIcon } from 'lucide-react'
import { useRouter } from '@/i18n/navigation'
import { Button } from '@/shared/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { useUserStore, useHasPermission } from '@/shared/stores/use-user-store'
import { PERMISSIONS } from '@/shared/constants/permissions'
import { dayjs } from '@/lib/date-utils'
import { useMarkNotificationRead, useMarkAllNotificationsRead } from '../(hooks)/use-notification-actions'
import { useNotificationList, toNotificationItem, type NotificationItem, type TFn } from '../(hooks)/use-notification-list'
import { useNotificationSse } from '../(hooks)/use-notification-sse'
import { NotificationPanel } from './notification-panel'

const normalize = (s: string) => s.toLowerCase().replace(/[-_\s]/g, '')
const CAM_NAV_KEYS = ['customer-activation', 'cam', 'customerActivation'].map(normalize)

export function NotificationBell() {
  const navbar = useUserStore((s) => s.navbar)
  const hasAccess =
    navbar === null ||
    navbar.includes('*') ||
    navbar.map(normalize).some((k) => CAM_NAV_KEYS.includes(k))
  const isInternalAdmin = useHasPermission(PERMISSIONS.CustomerActivation.InternalAdmin)

  const t = useTranslations('customerActivation.notifications')
  const tStatus = useTranslations('activationView')
  const locale = useLocale()
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [localNotifications, setLocalNotifications] = useState<NotificationItem[]>([])
  const [synced, setSynced] = useState(false)

  const { notifications: apiNotifications, hasNextPage, loadMore, isFetching } = useNotificationList()
  const markOne = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()

  // Sync API data on first load, then merge in any newly loaded pages
  useEffect(() => {
    if (!synced) {
      if (apiNotifications.length > 0) {
        setLocalNotifications(apiNotifications)
        setSynced(true)
      }
      return
    }
    setLocalNotifications((prev) => {
      const seen = new Set(prev.map((n) => n.id))
      const fresh = apiNotifications.filter((n) => !seen.has(n.id))
      if (fresh.length === 0) return prev
      return [...prev, ...fresh]
    })
  }, [apiNotifications, synced])

  useNotificationSse({
    enabled: hasAccess,
    onMessage: (event) => {
      try {
        const parsed = JSON.parse(event.data)
        // Server may push either a bare payload/envelope, or a socket.io-style [eventName, payload] tuple.
        const payload = Array.isArray(parsed) ? parsed[1] : parsed
        const raw = typeof payload?.data === 'string' ? JSON.parse(payload.data) : payload
        const item = toNotificationItem(raw, t as unknown as TFn, locale, tStatus as unknown as TFn)
        const withTime: NotificationItem = {
          ...item,
          time: item.time || dayjs.utc().locale(locale).format('ddd, DD.MM.YY · HH:mm'),
        }
        setLocalNotifications((prev) => {
          const existingIndex = prev.findIndex((notification) => notification.id === withTime.id)
          if (existingIndex === -1) return [withTime, ...prev]

          return [
            { ...prev[existingIndex], ...withTime },
            ...prev.filter((_, index) => index !== existingIndex),
          ]
        })
        setSynced(true)
      } catch {
        // ignore malformed SSE frames
      }
    },
  })

  const notifications = synced ? localNotifications : apiNotifications
  const hasUnread = notifications.some((n) => !n.read)

  const handleMarkRead = (id: string) => {
    markOne.mutate(id, {
      onSuccess: () => {
        setLocalNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      },
    })
  }

  const handleMarkAllRead = () => {
    markAll.mutate(undefined, {
      onSuccess: () => {
        setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      },
    })
  }

  const handleClickItem = useCallback(
    (notification: NotificationItem) => {
      if (!notification.activationId) return
      setOpen(false)

      if (isInternalAdmin) {
        const params = new URLSearchParams({ activation_id: notification.activationId })
        if (notification.defaultTab) params.set('activationTab', notification.defaultTab)
        if (notification.jumpToMessageId) params.set('jump_to_message', notification.jumpToMessageId)
        router.push(`/customer-activation/${notification.activationId}?${params.toString()}`)
        return
      }

      const params = new URLSearchParams({ activation_drawer: 'open', activation_id: notification.activationId })
      if (notification.defaultTab) params.set('activationTab', notification.defaultTab)
      if (notification.jumpToMessageId) params.set('jump_to_message', notification.jumpToMessageId)

      router.push(`/customer-activation?${params.toString()}`)
    },
    [isInternalAdmin, router],
  )

  if (!hasAccess) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative size-10" aria-label="notifications">
          <BellIcon className="size-5" />
          {hasUnread && (
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-auto p-0 rounded-xl">
        <NotificationPanel
          notifications={notifications}
          onMarkAllAsRead={handleMarkAllRead}
          onMarkRead={handleMarkRead}
          onClickItem={handleClickItem}
          onClose={() => setOpen(false)}
          hasNextPage={hasNextPage}
          isFetching={isFetching}
          onLoadMore={loadMore}
        />
      </PopoverContent>
    </Popover>
  )
}
