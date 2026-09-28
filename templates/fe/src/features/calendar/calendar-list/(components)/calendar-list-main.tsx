'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Clock, ListFilter } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/components/ui/button'
import { SearchInput } from '@/shared/components/common/search-input'
import { TablerFilters } from '@/shared/components/common/icons'
import { useInfiniteScroll } from '@/shared/hooks/use-infinite-scroll'
import { useHasPermission } from '@/shared/stores/use-user-store'
import { PERMISSION_ALL_WILDCARD } from '@/shared/constants/permissions'
import { useCalendarListFilters } from '../(hooks)/use-calendar-list-filters'
import {
  useCalendarListData,
  mergeCalendarEventGroups,
  type CalendarEventItem,
} from '../(hooks)/use-calendar-list-data'
import { CalendarListResults } from './calendar-list-results'
import { CalendarListSelectFilter } from './calendar-list-select-filter'
import { CalendarListDateFilter } from './calendar-list-date-filter'
import { CalendarListPartnershipFilter } from './calendar-list-partnership-filter'
import { CalendarListTargetAudienceFilter } from './calendar-list-target-audience-filter'
import { CalendarListExportFilter } from './calendar-list-export-filter'
import { CalendarListManagerFilter } from './calendar-list-manager-filter'
import { EventListSaveFilter } from '@/features/events/event-list/(components)/event-list-save-filter'
import { useSyncFilterPreferences } from '@/features/events/event-list/(hooks)/use-sync-filter-preferences'
import { useDeleteEvent } from '@/features/events/event-form/(hooks)/use-delete-event'
import { EventListDeleteDialog } from '@/features/events/event-list/(components)/event-list-delete-dialog'
import {
  DEFAULT_SAVED_FILTERS,
  calendarListUrlHasExplicitFilters,
  calendarListUrlToSaved,
  savedToCalendarListUrl,
} from '@/features/events/event-list/(helpers)/user-filter-preferences'

export function CalendarListMain() {
  const t = useTranslations('calendarList')
  const queryClient = useQueryClient()
  const { deleteEvent, isPending: isDeleting } = useDeleteEvent()
  const [eventToDelete, setEventToDelete] = useState<CalendarEventItem | null>(null)
  const isWildcardAdmin = useHasPermission(PERMISSION_ALL_WILDCARD)
  const {
    filters,
    setFilters,
    statusOptions,
    timeFrameOptions,
    eventTypeOptions,
    partnershipTypesOptions,
    takeOptions,
    searchPlaceholder,
    isOnlyMine,
    toggleOnlyMine,
  } = useCalendarListFilters()

  const prefsReady = useSyncFilterPreferences(
    'EVENT_CALENDAR_LIST',
    calendarListUrlHasExplicitFilters(filters),
    (saved) => setFilters(savedToCalendarListUrl(saved)),
  )
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useCalendarListData({
    search: filters.keyword,
    status: filters.status,
    eventTypeId: filters.eventTypeId,
    timeFrame: filters.timeFrame,
    startDate: filters.startDate,
    endDate: filters.endDate,
    partnershipTypes: filters.partnershipTypes,
    productPartnerCategories: filters.productPartnerCategories,
    targetAudience: filters.targetAudience,
    onlyMine: filters.onlyMine,
    userId: filters.userId,
    limit: filters.take && filters.take !== 'all' ? Number(filters.take) : undefined,
  }, { enabled: prefsReady })
  const isListLoading = !prefsReady || isLoading

  const sentinelRef = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    hasMore: !!hasNextPage,
    enabled: !isFetchingNextPage,
  })

  const groups = data?.pages.flatMap((page) => page?.groups ?? []) ?? []
  const groupedEvents = mergeCalendarEventGroups(groups)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          useDebounced
          searchKey="keyword"
          placeholder={searchPlaceholder}
          className="w-65 max-w-full bg-card"
        />
        <div className="flex items-center gap-2">
          {isWildcardAdmin && <CalendarListExportFilter />}
          <EventListSaveFilter
            screen="EVENT_CALENDAR_LIST"
            namespace="calendarList"
            payload={calendarListUrlToSaved(filters)}
            onReset={() => setFilters(savedToCalendarListUrl(DEFAULT_SAVED_FILTERS))}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <CalendarListSelectFilter
          label={t('filterEventType')}
          value={filters.eventTypeId}
          options={eventTypeOptions}
          onChange={(v) => setFilters({ eventTypeId: v === 'all' ? null : v })}
          icon={<ListFilter className="size-3.5" />}
        />
        <CalendarListSelectFilter
          label={t('filterStatus')}
          value={filters.status ?? 'all'}
          options={statusOptions}
          onChange={(v) => setFilters({ status: v === 'all' ? null : v })}
          icon={<TablerFilters className="size-4" />}
          isActive
        />
        <CalendarListSelectFilter
          label={t('filterTimeFrame')}
          value={filters.timeFrame ?? 'all'}
          options={timeFrameOptions}
          onChange={(v) => setFilters({ timeFrame: v })}
          icon={<Clock className="size-3.5" />}
          isActive
        />
        <CalendarListDateFilter />
        <CalendarListPartnershipFilter partnerships={partnershipTypesOptions} />
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-8 bg-card text-sm font-semibold',
            isOnlyMine &&
            'border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
          )}
          onClick={toggleOnlyMine}
        >
          {t('myEvent')}
        </Button>
        <CalendarListManagerFilter />
        <CalendarListTargetAudienceFilter />
        <CalendarListSelectFilter
          label={t('filterTake')}
          value={filters.take}
          options={takeOptions}
          triggerLabel={filters.take ? `${filters.take} ${t('perPage')}` : undefined}
          onChange={(v) => setFilters({ take: v === 'all' ? null : v })}
        />
      </div>

      <EventListDeleteDialog
        event={eventToDelete}
        onClose={() => setEventToDelete(null)}
        isPending={isDeleting}
        onConfirm={async (event) => {
          await deleteEvent(event.id, () => {
            queryClient.invalidateQueries({ queryKey: ['calendar-list'] })
            setEventToDelete(null)
          })
        }}
      />

      <CalendarListResults
        groups={groupedEvents}
        isLoading={isListLoading}
        isFetchingNextPage={isFetchingNextPage}
        sentinelRef={sentinelRef}
        onShowAllAction={() => setFilters({ timeFrame: 'all' })}
        onDeleteClickAction={setEventToDelete}
      />
    </div>
  )
}
