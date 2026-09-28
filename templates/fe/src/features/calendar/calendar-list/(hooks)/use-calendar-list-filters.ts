'use client'

import { parseAsArrayOf, parseAsString, parseAsBoolean, useQueryState, useQueryStates } from 'nuqs'
import { useTranslations } from 'next-intl'
import { useEventFilterConfig } from '@/features/events/event-list/(hooks)/use-event-filter-config'

const TAKE_OPTIONS = ['10', '20', '50', '100']

// Calendar shares the events filter-config API (GET /etr/events/filter-config)
// instead of hardcoding its own status/timeFrame/eventType/partnership/
// targetAudience option lists — same cache key as the events list, so no
// extra network round-trip when both are visited in one session.
export function useCalendarListFilters() {
  const t = useTranslations('calendarList')
  const { data: config, isLoading: isLoadingConfig } = useEventFilterConfig()

  // Kept separate from the batched useQueryStates below — SearchInput manages
  // this same "keyword" URL key via its own useQueryState instance, and mixing
  // useQueryState + useQueryStates for one key does not stay in sync.
  const [keyword] = useQueryState('keyword', parseAsString.withDefault(''))

  const [filters, setFilters] = useQueryStates({
    status: parseAsString,
    eventTypeId: parseAsString,
    timeFrame: parseAsString.withDefault('UPCOMING'),
    startDate: parseAsString,
    endDate: parseAsString,
    partnershipTypes: parseAsArrayOf(parseAsString),
    productPartnerCategories: parseAsArrayOf(parseAsString),
    targetAudience: parseAsArrayOf(parseAsString),
    onlyMine: parseAsBoolean.withDefault(true),
    userId: parseAsString,
    take: parseAsString,
  })

  // Status and timeFrame labels come from the backend as-is — the API
  // already returns locale-appropriate copy for these, so no FE-side
  // relabeling table to keep in sync with its enum values.
  const statusOptions = [
    { value: 'all', label: t('statusAll') },
    ...(config?.status ?? []),
  ]

  // The backend's timeFrame enum already includes its own "ALL" entry —
  // only add the FE-only synthetic one when the API didn't provide it,
  // otherwise the dropdown shows "All" twice.
  const apiTimeFrame = config?.timeFrame ?? []
  const hasApiAllOption = apiTimeFrame.some((item) => item.value.toUpperCase() === 'ALL')
  const timeFrameOptions = [
    ...apiTimeFrame,
    ...(hasApiAllOption ? [] : [{ value: 'all', label: t('timeFrameAll') }]),
  ]

  const eventTypeOptions = [
    { value: 'all', label: t('eventTypeAll') },
    ...(config?.eventTypeId ?? []),
  ]

  const partnershipTypesOptions = config?.partnershipTypes ?? []

  const targetAudienceOptions = config?.targetAudience ?? []

  // Always render the Event Manager filter, even when this comes back empty
  // — same as the events variant (EventListManagerFilter has no guard on
  // managerOptions.length either).
  const managerOptions = config?.createdBy ?? []

  const takeOptions = [
    ...TAKE_OPTIONS.map((v) => ({ value: v, label: v })),
    { value: 'all', label: t('takeDefault') },
  ]

  function toggleOnlyMine() {
    // onlyMine now defaults to true, so toggling off must set an explicit
    // `false` — `null` would just collapse back to the default via nuqs.
    setFilters({ onlyMine: !filters.onlyMine })
  }

  return {
    filters: { ...filters, keyword },
    setFilters,
    statusOptions,
    timeFrameOptions,
    eventTypeOptions,
    partnershipTypesOptions,
    targetAudienceOptions,
    managerOptions,
    takeOptions,
    searchPlaceholder: t('searchPlaceholder'),
    isOnlyMine: !!filters.onlyMine,
    toggleOnlyMine,
    isLoadingConfig,
  }
}
