'use client'

import React from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations, useLocale } from 'next-intl'
import { dayjs } from '@/lib/date-utils'
import { apiProxy } from '@/lib/api'
import { getActivationStatusTranslationKey } from '../../(helpers)/cam-constants'

// ── Types ──────────────────────────────────────────────────────────────────

export type CamNotificationActivation = {
  name?: string
  code?: string
}

type NotificationMetadata = Record<string, unknown> & {
  occurrenceCount?: number
  messageId?: string
  messageContent?: string
  activation?: CamNotificationActivation
  from?: string
  to?: string
}

export type CamNotificationActor = {
  id?: string
  name?: string | null
  avatar?: string | null
}

export type CamNotificationSchema = {
  id?: string
  _id?: string
  type: string
  status?: 'read' | 'unread' | string
  referenceId?: string
  referenceType?: string
  createdAt?: string
  updatedAt?: string
  metadata?: NotificationMetadata
  sender?: CamNotificationActor
  recipient?: CamNotificationActor
}

type NotificationListEnvelope = {
  message: string
  status: number
  data: CamNotificationSchema[]
}

/** The endpoint may respond with the envelope or the bare array — normalize either shape. */
function extractNotificationItems(
  payload: NotificationListEnvelope | CamNotificationSchema[] | undefined,
): CamNotificationSchema[] {
  if (Array.isArray(payload)) return payload
  return Array.isArray(payload?.data) ? payload.data : []
}

export type NotificationItem = {
  id: string
  type: string
  avatarImage?: string
  userName?: string
  action: React.ReactNode
  messageContent?: string
  activationName?: string
  activationCode?: string
  occurrenceCount: number
  time: string
  read: boolean
  activationId?: string
  defaultTab?: 'communication' | 'overview'
  jumpToMessageId?: string
}

// ── Constants ──────────────────────────────────────────────────────────────

export const NOTIFICATION_LIST_QUERY_KEY = 'cam-notifications'

// ── Utilities ──────────────────────────────────────────────────────────────

function formatStatusLabel(status: unknown, tStatus: TFn): string {
  if (typeof status !== 'string') return ''
  const key = getActivationStatusTranslationKey(status)
  return key ? tStatus(key) : status
}

/**
 * Splits a template string on `{{activation}}` and renders the activation
 * name as a styled `<span>`. Other `{{vars}}` are replaced as plain strings.
 */
function renderTemplate(
  template: string,
  vars: { activation?: string; status?: string; count?: number },
): React.ReactNode {
  let processed = template
  if (vars.status != null) processed = processed.replace('__STATUS__', vars.status)
  if (vars.count != null) processed = processed.replace('__COUNT__', String(vars.count))

  const parts = processed.split('__ACTIVATION__')
  if (parts.length === 1 || !vars.activation) return parts.join(vars.activation ?? '')

  const [before, after] = parts
  return (
    <>
      {before}
      <span className="text-primary">{vars.activation}</span>
      {after}
    </>
  )
}

type TFn = (key: string) => string

function buildActionText(n: CamNotificationSchema, t: TFn, tStatus: TFn): React.ReactNode {
  const activation = n.metadata?.activation?.name
  const count = n.metadata?.occurrenceCount ?? 1
  const hasActor = typeof n.sender?.name === 'string' && !!n.sender.name

  if (n.type === 'STATUS_CHANGED') {
    const status = formatStatusLabel(n.metadata?.to, tStatus)
    if (activation && status)
      return renderTemplate(t('STATUS_CHANGED'), { activation, status })
    if (activation)
      return renderTemplate(t('STATUS_CHANGED_NO_STATUS'), { activation })
    return t('STATUS_CHANGED_UNKNOWN')
  }

  if (n.type === 'MEMBER_ADDED' || n.type === 'ASSIGNED') {
    if (activation) return renderTemplate(t('MEMBER_ADDED'), { activation })
    return t('MEMBER_ADDED_UNKNOWN')
  }

  if (n.type === 'FEEDBACK_CREATED') {
    if (activation) return renderTemplate(t('FEEDBACK_CREATED'), { activation })
    return t('FEEDBACK_CREATED_UNKNOWN')
  }

  if (n.type === 'ACTIVITY_ADDED') {
    if (activation) return renderTemplate(t('ACTIVITY_ADDED'), { activation })
    return t('ACTIVITY_ADDED_UNKNOWN')
  }

  if (n.type === 'ALL_FEEDBACKS_RESOLVED') {
    if (activation) return renderTemplate(t('ALL_FEEDBACKS_RESOLVED'), { activation })
    return t('ALL_FEEDBACKS_RESOLVED_UNKNOWN')
  }

  if (n.type === 'MENTION') {
    if (count > 1) {
      if (activation) return renderTemplate(t('MENTION_BULK'), { activation, count })
      return t('MENTION_BULK_UNKNOWN').replace('__COUNT__', String(count))
    }
    if (activation) return renderTemplate(t('MENTION'), { activation })
    return t('MENTION_UNKNOWN')
  }

  if (n.type === 'CHAT_MESSAGE') {
    if (count > 1) {
      if (activation) return renderTemplate(t('CHAT_MESSAGE_BULK'), { activation, count })
      return t('CHAT_MESSAGE_BULK_UNKNOWN').replace('__COUNT__', String(count))
    }
    if (count === 1 && hasActor && activation)
      return renderTemplate(t('CHAT_MESSAGE'), { activation })
    if (activation)
      return renderTemplate(t('CHAT_MESSAGE_BULK'), { activation, count: 1 })
    return t('CHAT_MESSAGE_UNKNOWN')
  }

  return activation ?? n.type
}

function isRead(status: unknown): boolean {
  return status === 'read'
}

function toNotificationItem(
  n: CamNotificationSchema,
  t: TFn,
  locale: string,
  tStatus: TFn,
): NotificationItem {
  const id = n.id ?? n._id

  if (!id) {
    throw new Error('Notification is missing id')
  }

  const avatarSrc = typeof n.sender?.avatar === 'string' ? n.sender.avatar : undefined
  const userName = typeof n.sender?.name === 'string' ? n.sender.name : undefined
  const action = buildActionText(n, t, tStatus)

  const activationName =
    typeof n.metadata?.activation?.name === 'string' ? n.metadata.activation.name : undefined

  const activationCode =
    typeof n.metadata?.activation?.code === 'string' ? n.metadata.activation.code : undefined

  const COMMUNICATION_TYPES = ['MENTION', 'CHAT_MESSAGE']
  const ACTIVITY_TYPES = ['ACTIVITY_ADDED', 'FEEDBACK_CREATED', 'ALL_FEEDBACKS_RESOLVED']

  const isCommunicationTab = COMMUNICATION_TYPES.includes(n.type)
  const defaultTab = isCommunicationTab
    ? ('communication' as const)
    : ACTIVITY_TYPES.includes(n.type)
      ? ('overview' as const)
      : undefined

  const jumpToMessageId =
    isCommunicationTab && typeof n.metadata?.messageId === 'string'
      ? n.metadata.messageId
      : undefined

  const occurrenceCount = n.metadata?.occurrenceCount ?? 1
  const isBulk = n.type === 'MENTION' && occurrenceCount > 1

  const time = n.updatedAt ?? n.createdAt
  const formattedTime = time
    ? dayjs.utc(time).locale(locale).format('ddd, DD.MM.YY · HH:mm')
    : ''

  return {
    id,
    type: n.type,
    avatarImage: isBulk ? undefined : avatarSrc,
    userName: isBulk ? undefined : userName,
    action,
    messageContent: typeof n.metadata?.messageContent === 'string' ? n.metadata.messageContent : undefined,
    activationName,
    activationCode,
    occurrenceCount,
    time: formattedTime,
    read: isRead(n.status),
    activationId: n.referenceType === 'ACTIVATION' ? n.referenceId : undefined,
    defaultTab,
    jumpToMessageId,
  }
}

// ── Hook ───────────────────────────────────────────────────────────────────

export { toNotificationItem }
export type { TFn }

export function useNotificationList({ limit = 20 }: { limit?: number } = {}) {
  const t = useTranslations('customerActivation.notifications')
  const tStatus = useTranslations('activationView')
  const locale = useLocale()

  const [page, setPage] = React.useState(1)
  const [accumulated, setAccumulated] = React.useState<CamNotificationSchema[]>([])

  const { data, isLoading, isFetching, isError, refetch } = useQuery<
    NotificationListEnvelope | CamNotificationSchema[]
  >({
    queryKey: [NOTIFICATION_LIST_QUERY_KEY, page, limit],
    queryFn: async () => {
      const res = await apiProxy.get<NotificationListEnvelope | CamNotificationSchema[]>(
        '/notification/inapp',
        { params: { page, limit }, _skipToast: true } as object,
      )
      return res.data
    },
    staleTime: 0,
    // Renders in the shared header on every page, like the sidebar — an outage here
    // must degrade to an empty bell, not crash the module page via the error.tsx boundary.
    throwOnError: false,
  })

  const items = extractNotificationItems(data)

  React.useEffect(() => {
    if (items.length === 0) return
    setAccumulated((prev) => {
      if (page === 1) return items
      const seen = new Set(prev.map((n) => n.id))
      return [...prev, ...items.filter((n) => !seen.has(n.id))]
    })
  }, [data, page])

  const hasNextPage = items.length === limit

  const loadMore = () => {
    if (!hasNextPage || isFetching) return
    setPage((p) => p + 1)
  }

  return {
    notifications: accumulated.map((n) => toNotificationItem(n, t as unknown as TFn, locale, tStatus as unknown as TFn)),
    hasNextPage,
    loadMore,
    unreadCount: accumulated.filter((n) => n.status !== 'read').length,
    isLoading,
    isFetching,
    isError,
    refetch,
  }
}

export function useInvalidateNotifications() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: [NOTIFICATION_LIST_QUERY_KEY] })
}
