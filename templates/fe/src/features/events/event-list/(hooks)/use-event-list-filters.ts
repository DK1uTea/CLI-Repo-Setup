'use client'

import { parseAsString, useQueryStates } from 'nuqs'
import { useTranslations } from 'next-intl'
import { useEventFilterConfig } from './use-event-filter-config'

const LIMIT_OPTIONS = ['10', '20', '50', '100']

export function useEventListFilters() {
  const t = useTranslations('events.list')
  const { data: config, isLoading: isLoadingConfig } = useEventFilterConfig()

  const [filters, setFilters] = useQueryStates({
    keyword: parseAsString.withDefault(''),
    status: parseAsString,
    event_type: parseAsString,
    timeFrame: parseAsString.withDefault('UPCOMING'),
    my_event: parseAsString.withDefault('true'),
    userId: parseAsString,
    targetAudience: parseAsString,
    partnershipTypes: parseAsString,
    productPartnerCategories: parseAsString,
    limit: parseAsString,
    start_date: parseAsString,
    end_date: parseAsString,
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

  const types = config?.eventTypeId || []
  const eventTypeOptions = [
    { value: 'all', label: t('eventTypeAll') },
    ...types.map((item) => ({
      value: item.value,
      label: item.label,
    })),
  ]

  const limitOptions = [
    ...LIMIT_OPTIONS.map((v) => ({ value: v, label: v })),
    { value: 'all', label: t('takeDefault') },
  ]

  const partnershipTypesOptions = config?.partnershipTypes ?? []

  const targetAudienceOptions = config?.targetAudience ?? []

  const managerOptions = config?.createdBy ?? []

  function toggleMyEvent() {
    setFilters({ my_event: filters.my_event === 'true' ? 'false' : 'true' })
  }

  function setTimeFrame(timeFrame: string) {
    return setFilters({ timeFrame })
  }

  return {
    filters,
    setFilters,
    statusOptions,
    timeFrameOptions,
    eventTypeOptions,
    limitOptions,
    partnershipTypesOptions,
    targetAudienceOptions,
    managerOptions,
    searchPlaceholder: t('searchPlaceholder'),
    isMyEvent: filters.my_event === 'true',
    toggleMyEvent,
    setTimeFrame,
    isLoadingConfig,
  }
}
