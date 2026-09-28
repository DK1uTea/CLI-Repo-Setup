'use client'

import { useTranslations } from 'next-intl'
import { MapPin, Users, AlignLeft, Pencil, X } from 'lucide-react'
import { dayjs } from '@/lib/date-utils'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/shared/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { ExpandableHtml } from '@/shared/components/common/expandable-html'
import type { CalendarEvent } from '@/features/events/event-calendar/(hooks)/use-event-calendar-data'

type Props = {
  event: CalendarEvent | null
  onClose: () => void
  onDeleteClickAction: (event: CalendarEvent) => void
}

function formatRange(start: string, end: string): string {
  const fmtDay = (d: string) => dayjs.utc(d).format('dddd, MMMM D')
  const fmtTime = (d: string) => dayjs.utc(d).format('HH:mm')
  return `${fmtDay(start)} · ${fmtTime(start)} – ${fmtDay(end)} · ${fmtTime(end)}`
}

export function EventCalendarEventDialog({ event, onClose, onDeleteClickAction }: Props) {
  const t = useTranslations('events.calendar')
  const tList = useTranslations('events.list')
  const tCommon = useTranslations('common')

  return (
    <Dialog open={!!event} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent showCloseButton={false} className="sm:max-w-md gap-0 p-0">
        <DialogHeader className="gap-1 p-5 pb-4">
          <DialogTitle className="pr-8 text-lg font-bold leading-snug" translate="no">
            {event?.title}
          </DialogTitle>
          <DialogDescription className="font-medium text-foreground">
            {event && formatRange(event.startDate, event.endDate)}
          </DialogDescription>
          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm" className="absolute top-3 right-3 text-primary hover:text-primary">
              <X />
              <span className="sr-only">{tList('deleteDialogCancel')}</span>
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="flex flex-col gap-5 px-5 pb-5">
          {event?.city && (
            <div className="flex gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="font-medium" translate="no">{event.city}</p>
                {event.address && (
                  <p className="text-sm text-primary" translate="no">{event.address}</p>
                )}
              </div>
            </div>
          )}

          {event && event.adminContact && (
            <div className="flex gap-3">
              <Users className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              <div className="flex min-w-0 flex-col gap-2">
                <p className="font-medium">{t('guests', { count: 1 })}</p>
                <div className="flex items-center gap-2" translate="no">
                  <Avatar size="sm">
                    <AvatarFallback>{(event.adminContact.name || '').charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 text-sm leading-tight">
                    <p className="truncate font-medium">{event.adminContact.name}</p>
                    {event.adminContact.email && (
                      <p className="truncate text-muted-foreground">{event.adminContact.email}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <AlignLeft className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{t('description')}</p>
              {event?.description ? (
                <ExpandableHtml
                  html={event.description}
                  className="prose prose-sm max-w-none text-sm text-muted-foreground"
                  seeMoreLabel={tCommon('seeMore')}
                  seeLessLabel={tCommon('seeLess')}
                />
              ) : (
                <p className="text-sm text-muted-foreground">{t('noDescription')}</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 border-t-0 bg-transparent p-5 pt-2">
          {event?.isOwner && (
            <Button variant="outline-primary" onClick={() => event && onDeleteClickAction(event)}>
              {tList('delete')}
            </Button>
          )}
          <Button href={event ? `/events/update-event?eventId=${event.id}` : '#'}>
            {tList('edit')}
            <Pencil />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
