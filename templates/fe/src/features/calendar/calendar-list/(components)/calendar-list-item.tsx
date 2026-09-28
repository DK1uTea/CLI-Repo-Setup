'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { OptionMenu } from '@/shared/components/ui/option-menu'
import { CalendarDays, Pencil, Trash2 } from 'lucide-react'
import { dayjs, formatDate } from '@/lib/date-utils'
import { useDateFormat, useHasPermission } from '@/shared/stores/use-user-store'
import { PERMISSIONS, PERMISSION_ALL_WILDCARD } from '@/shared/constants/permissions'
import { getEventTypeColor } from '@/features/events/event-list/(helpers)/event-type-colors'
import { useEventFilterConfig } from '@/features/events/event-list/(hooks)/use-event-filter-config'
import type { CalendarEventItem } from '../(hooks)/use-calendar-list-data'

type Props = {
  event: CalendarEventItem
  onDeleteClickAction?: (event: CalendarEventItem) => void
}

export function CalendarListItem({ event, onDeleteClickAction }: Props) {
  const t = useTranslations('calendarList')
  const dateFormat = useDateFormat()
  const isCalendarAdmin = useHasPermission(PERMISSION_ALL_WILDCARD)
  const hasUpdatePermission = useHasPermission(PERMISSIONS.Calendar.Update)
  const hasDeletePermission = useHasPermission(PERMISSIONS.Calendar.Delete)
  const canEdit = (isCalendarAdmin || !!event.isOwner) && hasUpdatePermission
  const canDelete = !!event.isOwner || hasDeletePermission
  const { data: config } = useEventFilterConfig()
  const typeColor = getEventTypeColor(event.type, config?.eventTypeId ?? [])

  const displayDate = event.startDate
  const day = dayjs.utc(displayDate).format('D')
  const month = dayjs.utc(displayDate).format('MMM')
  const startFormatted = event.startDate ? formatDate(event.startDate, dateFormat) : '-'
  const endFormatted = event.endDate ? formatDate(event.endDate, dateFormat) : '-'
  const contactName = event.adminContact?.name

  const detailHref = `/calendar-event-detail/${event.id}`
  const editHref = `/calendar-dashboard/update-calendar-event?eventId=${event.id}`

  return (
    <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row lg:items-center p-3 md:p-7 pb-5 md:pr-12 bg-card hover:bg-background/50">
      <div className="flex min-w-0 flex-1 items-start gap-2 md:contents">
        <Link href={detailHref} className="flex min-w-0 flex-1 items-center gap-4">
        <div className="flex h-12.5 w-11 shrink-0 flex-col items-center justify-center rounded-lg border bg-gray-100">
          <span className="text-base font-bold leading-none">{day}</span>
          <span className="mt-0.5 text-[10px] font-medium uppercase text-muted-foreground">
            {month}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            {event.title && (
              <span className="wrap-break-word text-base font-semibold leading-snug" translate="no">{event.title}</span>
            )}
            {event.type && (
              <Badge
                className="shrink-0 font-normal border-none gap-1.5"
                style={{ backgroundColor: typeColor.bgColor, color: typeColor.color }}
              >
                <span className="size-2 rounded-xs" style={{ backgroundColor: typeColor.color }}></span>
                <span translate="no">{event.type}</span>
              </Badge>
            )}
          </div>

          <p className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
            <CalendarDays className="size-3.5 shrink-0" />
            <span>
              {startFormatted} - {endFormatted}
              {contactName && <span className="ml-1.5" translate="no">· {contactName}</span>}
            </span>
          </p>

          <div className="space-y-0.5 text-sm text-muted-foreground sm:hidden">
            <p className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5 shrink-0" />
              <span>{startFormatted} - {endFormatted}</span>
            </p>
            {contactName && (
              <p className="pl-5" translate="no">
                {contactName}
              </p>
            )}
          </div>
        </div>
        </Link>

        {event.status !== 'DELETED' && (canEdit || canDelete) && (
          <OptionMenu
            triggerClassName="md:hidden"
            items={[
              {
                key: 'edit',
                label: t('edit'),
                href: editHref,
                icon: <Pencil />,
                hidden: !canEdit,
              },
              {
                key: 'delete',
                label: t('delete'),
                icon: <Trash2 />,
                destructive: true,
                hidden: !canDelete,
                onClick: () => onDeleteClickAction?.(event),
              },
            ]}
          />
        )}
      </div>

      {event.status !== 'DELETED' && (canEdit || canDelete) && (
        <div className="hidden shrink-0 gap-2 md:flex md:self-end lg:self-auto">
          {canEdit && (
            <Button href={editHref} className="min-w-30">
              {t('edit')}
            </Button>
          )}
          {canDelete && (
            <Button
              variant="destructive"
              className="min-w-30"
              onClick={() => onDeleteClickAction?.(event)}
            >
              {t('delete')}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
