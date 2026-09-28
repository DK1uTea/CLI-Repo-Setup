'use client'

import { CalendarDaysIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { IconUsers } from '@/shared/components/common/icons'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/components/ui/empty'

import type { DashboardEvent } from '../(hooks)/use-dashboard-events'
import { useDashboardEvents } from '../(hooks)/use-dashboard-events'
import { DashboardEventCard } from './dashboard-event-card'

export default function DashboardEvents() {
  const t = useTranslations('dashboard')
  const { myEvents, teamEvents, isLoading } = useDashboardEvents()

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-2xl">
            <CalendarDaysIcon className="size-5 md:size-6" />
            {t('yourUpcomingEvents')}
          </CardTitle>
          <CardDescription className="text-[13px]">
            {t('yourUpcomingEventsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EventList
            events={myEvents}
            isLoading={isLoading}
            emptyTitle={t('noUpcomingEvents')}
            emptyDescription={t('noUpcomingEventsDescription')}
            showEmptyIcon={false}
            emptyTitleClassName="text-[15px] text-muted-foreground"
            emptyDescriptionClassName="text-[13px] text-muted-foreground"
            showStartingSoon
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-2xl">
            <IconUsers className="size-4.5" />
            {t('teamUpcomingEvents')}
          </CardTitle>
          <CardDescription className="text-[13px]">
            {t('teamUpcomingEventsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EventList
            events={teamEvents}
            isLoading={isLoading}
            emptyTitle={t('noTeamEvents')}
            emptyDescription={t('noTeamEventsDescription')}
            showStartingSoon={false}
          />
        </CardContent>
      </Card>
    </div>
  )
}

type EventListProps = {
  events: DashboardEvent[]
  isLoading: boolean
  emptyTitle: string
  emptyDescription: string
  showStartingSoon?: boolean
  showEmptyIcon?: boolean
  emptyTitleClassName?: string
  emptyDescriptionClassName?: string
}

function EventList({
  events,
  isLoading,
  emptyTitle,
  emptyDescription,
  showEmptyIcon = true,
  emptyTitleClassName,
  emptyDescriptionClassName,
  showStartingSoon = true,
}: EventListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <Empty>
        {showEmptyIcon && (
          <EmptyMedia><CalendarDaysIcon className="size-12 text-primary opacity-40" /></EmptyMedia>
        )}
        <EmptyHeader>
          <EmptyTitle className={emptyTitleClassName}>{emptyTitle}</EmptyTitle>
          <EmptyDescription className={emptyDescriptionClassName}>{emptyDescription}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {events.map((event) => (
        <DashboardEventCard
          key={event.id}
          event={event}
          showStartingSoon={showStartingSoon}
        />
      ))}
    </div>
  )
}
