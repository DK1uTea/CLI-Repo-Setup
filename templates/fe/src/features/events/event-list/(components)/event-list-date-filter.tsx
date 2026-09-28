'use client'

import { Calendar, ChevronDown } from 'lucide-react'
import { parseAsString, useQueryStates } from 'nuqs'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { dayjs } from '@/lib/date-utils'
import { DateRangePicker } from '@/shared/components/ui/date-range-picker'
import { Button } from '@/shared/components/ui/button'

type Props = {
  onApplyAction?: (from: string, to: string) => void
  onResetAction?: () => void
}

export function EventListDateFilter({ onApplyAction, onResetAction }: Props = {}) {
  const t = useTranslations('events.list')

  const [{ start_date, end_date }, setFilters] = useQueryStates({
    start_date: parseAsString,
    end_date: parseAsString,
    timeFrame: parseAsString,
  })

  const isActive = !!start_date && !!end_date

  const defaultValue = {
    from: start_date ? dayjs.utc(start_date).toDate() : undefined,
    to: end_date ? dayjs.utc(end_date).toDate() : undefined,
  }

  return (
    <DateRangePicker
      defaultValue={defaultValue}
      onApplyAction={(range) => {
        const from = range.from ? range.from.toISOString() : null
        const to = range.to ? range.to.toISOString() : null
        setFilters({ start_date: from, end_date: to })
        if (from && to) onApplyAction?.(from, to)
      }}
      onResetAction={() => {
        setFilters({ start_date: null, end_date: null })
        onResetAction?.()
      }}
      trigger={(
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-8 max-w-36 gap-1 bg-card text-sm font-semibold',
            isActive &&
              'border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
          )}
        >
          <Calendar className="size-3.5" />
          {t('filterDate')}
          <ChevronDown className="size-3.5 opacity-70" />
        </Button>
      )}
    />
  )
}
