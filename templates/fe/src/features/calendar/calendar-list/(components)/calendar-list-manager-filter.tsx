'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Users } from 'lucide-react'
import { LazyDropdown } from '@/shared/components/ui/lazy-dropdown'
import { useOwnershipTransferCandidates } from '@/features/events/event-detail/common/(hooks)/use-ownership-transfer-candidates'
import { useCalendarListFilters } from '../(hooks)/use-calendar-list-filters'

export function CalendarListManagerFilter() {
  const t = useTranslations('calendarList')
  const [open, setOpen] = useState(false)
  const { filters, setFilters } = useCalendarListFilters()
  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    useOwnershipTransferCandidates('', open)

  const userId = filters.userId
  const managers = data?.pages.flatMap((page) => page.candidates) ?? []
  const selected = managers.find((manager) => manager.id === userId)
  const isActive = !!userId && userId !== 'all'
  const displayLabel = isActive && selected
    ? selected.name
    : t('filterEventManager')

  return (
    <LazyDropdown
      triggerClassName="text-sm font-semibold"
      label={displayLabel}
      isActive={isActive}
      open={open}
      onOpenChange={setOpen}
      items={managers}
      selectedId={userId}
      onSelect={(id) => setFilters({ userId: id })}
      allLabel={t('statusAll')}
      isLoading={isLoading}
      getItemId={(manager) => manager.id}
      getItemLabel={(manager) => manager.name}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      icon={Users}
    />
  )
}
