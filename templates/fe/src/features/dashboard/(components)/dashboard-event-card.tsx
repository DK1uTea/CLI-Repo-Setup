'use client'

import { TriangleAlert } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { dayjs, nowUtc } from '@/lib/date-utils'
import { Badge } from '@/shared/components/ui/badge'

import type { DashboardEvent } from '../(hooks)/use-dashboard-events'

type Props = {
  event: DashboardEvent
  showStartingSoon?: boolean
}

export function DashboardEventCard({ event, showStartingSoon = true }: Props) {
  const t = useTranslations('dashboard')

  const startDate = dayjs.utc(event.startDate)
  const daysUntilStart = startDate
    .startOf('day')
    .diff(dayjs.utc(nowUtc()).startOf('day'), 'day')
  const isStartingSoon =
    startDate.isValid() && daysUntilStart >= 0 && daysUntilStart <= 10

  return (
    <Link
      href={`/event-detail/${event.id}`}
      className="flex flex-col items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-[15px] font-medium text-foreground">
            {event.name}
          </span>
          <span className="text-[13px] text-muted-foreground">
            {startDate.format('ddd, D MMM YYYY')} {t('at')} {startDate.format('HH:mm')}
          </span>
          {event.createdBy && (
            <span className="text-[13px] text-gray-400">
              {t('organizedBy', { name: event.createdBy })}
            </span>
          )}
        </div>
        {event.eventTypeName && (
          <Badge variant="outline" className="shrink-0 text-[14px] bg-muted/80">
            {event.eventTypeName}
          </Badge>
        )}
      </div>
      {showStartingSoon && isStartingSoon && (
        <div className="flex w-full items-center justify-start gap-2 rounded-md bg-destructive/20 px-3 py-1 text-red-700">
          <TriangleAlert aria-hidden="true" className="size-4" />
          <span className="font-medium">
            {daysUntilStart === 0 ? t('eventStartsToday') : t('eventStartsIn', { count: daysUntilStart })}
          </span>
        </div>
      )}
    </Link>
  )
}
