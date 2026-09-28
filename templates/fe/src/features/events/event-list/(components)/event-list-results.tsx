'use client'

import type { Ref } from 'react'
import { CalendarPlus } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { dayjs } from '@/lib/date-utils'
import { Button } from '@/shared/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/components/ui/empty'
import { LoadingIcon } from '@/shared/components/common/icons/icon-loading'
import type { EventItem, EventMonthGroup } from '../(hooks)/use-event-list-data'
import { EventGroup } from './event-group'
import { EventListSkeleton } from './event-list-skeleton'

type Props = {
  groups: EventMonthGroup[]
  isLoading: boolean
  isFetchingNextPage: boolean
  sentinelRef: Ref<HTMLDivElement>
  onShowAllAction: () => void
  onDeleteClickAction: (event: EventItem) => void
}

export function EventListResults({
  groups,
  isLoading,
  isFetchingNextPage,
  sentinelRef,
  onShowAllAction,
  onDeleteClickAction,
}: Props) {
  const t = useTranslations('events.list')
  const locale = useLocale()

  if (isLoading) return <EventListSkeleton />

  if (groups.length === 0) {
    return (
      <Empty>
        <EmptyMedia>
          <CalendarPlus className="size-14 text-primary opacity-40" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>{t('noEvents')}</EmptyTitle>
          <EmptyDescription>{t('noEventsDescription')}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button type="button" onClick={onShowAllAction}>{t('showMeAll')}</Button>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-12">
        {groups.map((group) => (
          <EventGroup
            key={group.month}
            monthYear={dayjs.utc(`${group.month}-01`).locale(locale).format('MMMM YYYY')}
            events={Array.isArray(group.events) ? group.events : []}
            onDeleteClickAction={onDeleteClickAction}
          />
        ))}
      </div>
      <div ref={sentinelRef} className="h-px" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-4"><LoadingIcon /></div>
      )}
    </>
  )
}
