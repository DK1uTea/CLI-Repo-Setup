'use client'

import { useState } from 'react'
import { Clock, ListFilter } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/components/ui/button'
import { SearchInput } from '@/shared/components/common/search-input'
import { TablerFilters } from '@/shared/components/common/icons'
import { useInfiniteScroll } from '@/shared/hooks/use-infinite-scroll'
import { useEventListFilters } from '../(hooks)/use-event-list-filters'
import { mergeEventMonthGroups, useEventListData } from '../(hooks)/use-event-list-data'
import { useSyncFilterPreferences } from '../(hooks)/use-sync-filter-preferences'
import { useQueryClient } from '@tanstack/react-query'
import { useDeleteEvent } from '../../event-form/(hooks)/use-delete-event'
import { EventListPartnershipFilter } from './event-list-partnership-filter'
import { EventListTargetAudienceFilter } from './event-list-target-audience-filter'
import { EventListManagerFilter } from './event-list-manager-filter'
import { EventListSelectFilter } from './event-list-select-filter'
import { EventListDateFilter } from './event-list-date-filter'
import { EventListDeleteDialog } from './event-list-delete-dialog'
import { EventListResults } from './event-list-results'
import { EventListExportFilter } from './event-list-export-filter'
import { EventListSaveFilter } from './event-list-save-filter'
import {
  DEFAULT_SAVED_FILTERS,
  eventListUrlHasExplicitFilters,
  eventListUrlToSaved,
  savedToEventListUrl,
} from '../(helpers)/user-filter-preferences'
import type { EventItem } from '../(hooks)/use-event-list-data'

export function EventListMain() {
  const t = useTranslations('events.list')
  const queryClient = useQueryClient()
  const { deleteEvent, isPending: isDeleting } = useDeleteEvent()
  const {
    filters,
    setFilters,
    statusOptions,
    timeFrameOptions,
    eventTypeOptions,
    limitOptions,
    partnershipTypesOptions,
    searchPlaceholder,
    isMyEvent,
    toggleMyEvent,
    setTimeFrame,
  } = useEventListFilters()

  const prefsReady = useSyncFilterPreferences(
    'EVENT_NAVIGATOR_LIST',
    eventListUrlHasExplicitFilters(filters),
    (saved) => setFilters(savedToEventListUrl(saved)),
  )
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useEventListData(filters, { enabled: prefsReady })
  const isListLoading = !prefsReady || isLoading

  const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null)

  const sentinelRef = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    hasMore: !!hasNextPage,
    enabled: !isFetchingNextPage,
  })
  const groups = data?.pages.flatMap((page) => (
    Array.isArray(page?.items) ? page.items : []
  )) ?? []
  const eventGroups = mergeEventMonthGroups(groups)

  return (
    <div className="flex flex-col gap-4">
      {/* Row 1: Search + Export + Save Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          useDebounced
          searchKey="keyword"
          placeholder={searchPlaceholder}
          className="w-65 max-w-full bg-card"
        />
        <div className="flex items-center gap-2">
          <EventListExportFilter />
          <EventListSaveFilter
            screen="EVENT_NAVIGATOR_LIST"
            payload={eventListUrlToSaved(filters)}
            onReset={() => setFilters(savedToEventListUrl(DEFAULT_SAVED_FILTERS))}
          />
        </div>
      </div>

      {/* Row 2: Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <EventListSelectFilter
          label={t('filterEventType')}
          value={filters.event_type}
          options={eventTypeOptions}
          onChange={(v) => setFilters({ event_type: v === 'all' ? null : v })}
          icon={<ListFilter className="size-3.5" />}
        />
        <EventListSelectFilter
          label={t('filterStatus')}
          value={filters.status ?? 'all'}
          options={statusOptions}
          onChange={(v) => setFilters({ status: v === 'all' ? null : v })}
          icon={<TablerFilters className="size-4" />}
          isActive
        />
        <EventListSelectFilter
          label={t('filterTimeFrame')}
          value={filters.timeFrame ?? 'all'}
          options={timeFrameOptions}
          isActive
          onChange={setTimeFrame}
          icon={<Clock className="size-3.5" />}
        />
        <EventListDateFilter />
        <EventListPartnershipFilter partnerships={partnershipTypesOptions} />
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-8 bg-card text-sm font-semibold',
            isMyEvent &&
            'border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
          )}
          onClick={toggleMyEvent}
        >
          {t('myEvent')}
        </Button>
        <EventListManagerFilter />
        <EventListTargetAudienceFilter />
        <EventListSelectFilter
          label={t('filterLimit')}
          value={filters.limit}
          options={limitOptions}
          triggerLabel={filters.limit ? `${filters.limit} ${t('perPage')}` : undefined}
          onChange={(v) => setFilters({ limit: v === 'all' ? null : v })}
        />
      </div>

      <EventListDeleteDialog
        event={eventToDelete}
        onClose={() => setEventToDelete(null)}
        isPending={isDeleting}
        onConfirm={async (event) => {
          await deleteEvent(event.id, () => {
            queryClient.invalidateQueries({ queryKey: ['event-list'] })
            setEventToDelete(null)
          })
        }}
      />

      <EventListResults
        groups={eventGroups}
        isLoading={isListLoading}
        isFetchingNextPage={isFetchingNextPage}
        sentinelRef={sentinelRef}
        onShowAllAction={() => setTimeFrame('all')}
        onDeleteClickAction={setEventToDelete}
      />
    </div>
  )
}
