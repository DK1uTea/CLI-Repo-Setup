'use client'

import { Funnel } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/components/ui/button'
import { SearchInput } from '@/shared/components/common/search-input'
import { TablerFilters } from '@/shared/components/common/icons'
import { useEventListFilters } from '@/features/events/event-list/(hooks)/use-event-list-filters'
import { EventListSelectFilter } from '@/features/events/event-list/(components)/event-list-select-filter'
import { EventListDateFilter } from '@/features/events/event-list/(components)/event-list-date-filter'
import { EventListPartnershipFilter } from '@/features/events/event-list/(components)/event-list-partnership-filter'
import { EventListManagerFilter } from '@/features/events/event-list/(components)/event-list-manager-filter'
import { EventListTargetAudienceFilter } from '@/features/events/event-list/(components)/event-list-target-audience-filter'
import { EventListSaveFilter } from '@/features/events/event-list/(components)/event-list-save-filter'
import { EventListExportFilter } from '@/features/events/event-list/(components)/event-list-export-filter'
import {
  DEFAULT_SAVED_FILTERS,
  eventCalendarUrlToSaved,
  savedToEventCalendarUrl,
} from '@/features/events/event-list/(helpers)/user-filter-preferences'
import type { CalendarViewKey } from '../(hooks)/use-event-calendar-view'

type Props = {
  viewKey: CalendarViewKey
  onChangeViewAction: (view: CalendarViewKey) => void
  onApplyDateRangeAction: (from: string, to: string) => void
  onResetDateRangeAction: () => void
}

export function EventCalendarToolbar({
  viewKey,
  onChangeViewAction,
  onApplyDateRangeAction,
  onResetDateRangeAction,
}: Props) {
  const t = useTranslations('events.list')
  const tCal = useTranslations('events.calendar')
  const {
    filters,
    setFilters,
    statusOptions,
    eventTypeOptions,
    partnershipTypesOptions,
    searchPlaceholder,
    isMyEvent,
    toggleMyEvent,
  } = useEventListFilters()

  const viewOptions = [
    { value: 'day', label: tCal('viewDay') },
    { value: 'week', label: tCal('viewWeek') },
    { value: 'month', label: tCal('viewMonth') },
  ]

  const calendarStatusOptions = statusOptions
    .filter((option) => ['active', 'draft'].includes(option.value.toLowerCase()))
    .map((option) => ({ ...option, value: option.value.toLowerCase() }))
  const calendarStatus = ['active', 'draft'].includes(filters.status?.toLowerCase() ?? '')
    ? filters.status?.toLowerCase()
    : 'active'

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
          <EventListExportFilter />
          <EventListSaveFilter
            screen="EVENT_NAVIGATOR_CALENDAR"
            payload={eventCalendarUrlToSaved(filters, viewKey)}
            onReset={() => {
              const restored = savedToEventCalendarUrl(DEFAULT_SAVED_FILTERS)
              setFilters(restored.filters)
              onChangeViewAction(restored.view)
            }}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <EventListSelectFilter
          label={t('filterEventType')}
          value={filters.event_type}
          options={eventTypeOptions}
          onChange={(v) => setFilters({ event_type: v === 'all' ? null : v })}
          icon={<Funnel className="size-3.5" />}
        />
        <EventListSelectFilter
          label={t('filterStatus')}
          value={calendarStatus}
          options={calendarStatusOptions}
          onChange={(status) => setFilters({ status })}
          icon={<TablerFilters className="size-4" />}
        />
        <EventListDateFilter onApplyAction={onApplyDateRangeAction} onResetAction={onResetDateRangeAction} />
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
        <EventListSelectFilter
          label={tCal('viewMonth')}
          value={viewKey}
          options={viewOptions}
          onChange={(v) => onChangeViewAction(v as CalendarViewKey)}
        />
        <EventListTargetAudienceFilter />
      </div>
    </div>
  )
}
