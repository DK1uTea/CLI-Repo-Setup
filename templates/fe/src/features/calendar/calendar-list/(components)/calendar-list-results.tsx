'use client'

import type { Ref } from 'react'
import { CalendarPlus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { dayjs } from '@/lib/date-utils'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/components/ui/empty'
import { LoadingIcon } from '@/shared/components/common/icons/icon-loading'
import type {
  CalendarEventGroup,
  CalendarEventItem,
} from '../(hooks)/use-calendar-list-data'
import { CalendarListItem } from './calendar-list-item'
import { CalendarListSkeleton } from './calendar-list-skeleton'

type Props = {
  groups: CalendarEventGroup[]
  isLoading: boolean
  isFetchingNextPage: boolean
  sentinelRef: Ref<HTMLDivElement>
  onShowAllAction: () => void
  onDeleteClickAction: (event: CalendarEventItem) => void
}

export function CalendarListResults({
  groups,
  isLoading,
  isFetchingNextPage,
  sentinelRef,
  onShowAllAction,
  onDeleteClickAction,
}: Props) {
  const t = useTranslations('calendarList')

  if (isLoading) return <CalendarListSkeleton />

  if (groups.length === 0) {
    return (
      <Empty className='min-h-100'>
        <EmptyMedia className='mb-5'>
          <CalendarPlus className="size-20 text-primary opacity-40" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>{t('noEvents')}</EmptyTitle>
          <EmptyDescription>{t('noEventsDescription')}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button type="button" onClick={onShowAllAction}>
            {t('showMeAll')}
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-12">
        {groups.map((group) => (
          <div key={group.month} className="flex flex-col gap-4">
            <h3 className="text-lg font-bold">
              {dayjs.utc(`${group.month}-01`).format('MMMM YYYY')}
            </h3>
            <Card className="gap-0 py-0">
              {group.events.map((event, index) => (
                <div key={event.id}>
                  <CalendarListItem
                    event={event}
                    onDeleteClickAction={onDeleteClickAction}
                  />
                  {index < group.events.length - 1 && <div className="h-px bg-border" />}
                </div>
              ))}
            </Card>
          </div>
        ))}
      </div>
      <div ref={sentinelRef} className="h-px" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <LoadingIcon />
        </div>
      )}
    </>
  )
}
