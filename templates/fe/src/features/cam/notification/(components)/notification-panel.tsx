'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { BellOffIcon, Loader2Icon, XIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/lib/utils'
import type { NotificationItem } from '../(hooks)/use-notification-list'
import { MentionPreview } from './mention-preview'
import { ChatMessagePreview } from './chat-message-preview'

type Props = {
  notifications: NotificationItem[]
  onMarkAllAsRead: () => void
  onMarkRead: (id: string) => void
  onClickItem?: (notification: NotificationItem) => void
  onClose?: () => void
  hasNextPage?: boolean
  isFetching?: boolean
  onLoadMore?: () => void
}

export function NotificationPanel({
  notifications,
  onMarkAllAsRead,
  onMarkRead,
  onClickItem,
  onClose,
  hasNextPage,
  isFetching,
  onLoadMore,
}: Props) {
  const t = useTranslations('customerActivation.notificationPanel')
  const unreadCount = notifications.filter((n) => !n.read).length

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!hasNextPage || isFetching || !onLoadMore) return
    const el = e.currentTarget
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 80) {
      onLoadMore()
    }
  }

  return (
    <div className="flex flex-col w-90 max-h-140">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold">{t('title')}</span>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-5.5 h-5.5 px-1.5 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
              {unreadCount}
            </span>
          )}
        </div>
        <Button variant="ghost" size="icon" className="size-8" onClick={onClose} aria-label="close">
          <XIcon className="size-4" />
        </Button>
      </div>

      <div className="border-t border-border" />

      {/* List */}
      <div className="overflow-y-auto flex-1 divide-y divide-border _custom-scroll" onScroll={handleScroll}>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
            <BellOffIcon className="size-9" />
            <p className="text-sm">{t('empty')}</p>
          </div>
        ) : (
          notifications.map((n) => {
            const isMention = n.type === 'MENTION' && !!n.messageContent
            const isChat = n.type === 'CHAT_MESSAGE'
            const initials = n.userName?.charAt(0).toUpperCase() ?? ''

            return (
              <div
                key={n.id}
                className="flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors cursor-pointer"
                onClick={() => { if (!n.read) onMarkRead(n.id); onClickItem?.(n) }}
              >
                {/* Avatar */}
                <Avatar className="size-9 shrink-0">
                  <AvatarImage src={n.avatarImage} />
                  <AvatarFallback className="text-xs">{initials || '🔔'}</AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {isMention && (
                    <MentionPreview content={n.messageContent!} time={n.time} showMoreLabel={t('showMore')} />
                  )}
                  {isChat && (
                    <ChatMessagePreview
                      activationName={n.activationName}
                      activationCode={n.activationCode}
                      count={n.occurrenceCount}
                      time={n.time}
                      label={t('newMessages')}
                    />
                  )}
                  {!isMention && !isChat && (
                    <>
                      <p className="text-sm leading-snug text-foreground">
                        {n.userName && <span className="font-semibold">{n.userName} </span>}
                        <span className="font-normal">{n.action}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                    </>
                  )}
                </div>

                {/* Unread dot */}
                <div className="pt-1 shrink-0">
                  <span className={cn('block size-2.5 rounded-full', n.read ? '' : 'bg-primary')} />
                </div>
              </div>
            )
          })
        )}
        {isFetching && notifications.length > 0 && (
          <div className="flex justify-center py-3">
            <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="border-t border-border" />

      {/* Footer */}
      <div className="flex justify-end px-4 py-3 shrink-0">
        <Button
          variant="outline-primary"
          size="sm"
          disabled={unreadCount === 0}
          onClick={onMarkAllAsRead}
        >
          {t('markAllRead')}
        </Button>
      </div>
    </div>
  )
}
