'use client'

import { Calendar, ChevronDown } from 'lucide-react'
import { parseAsString, useQueryStates } from 'nuqs'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { dayjs } from '@/lib/date-utils'
import { DateRangePicker } from '@/shared/components/ui/date-range-picker'
import { Button } from '@/shared/components/ui/button'

export function CalendarListDateFilter() {
  const t = useTranslations('calendarList')

  const [{ startDate, endDate }, setFilters] = useQueryStates({
    startDate: parseAsString,
    endDate: parseAsString,
  })

  const isActive = !!startDate && !!endDate

  const defaultValue = {
    from: startDate ? dayjs.utc(startDate).toDate() : undefined,
    to: endDate ? dayjs.utc(endDate).toDate() : undefined,
  }

  return (
    <DateRangePicker
      defaultValue={defaultValue}
      onApplyAction={(range) => {
        setFilters({
          startDate: range.from ? range.from.toISOString() : null,
          endDate: range.to ? range.to.toISOString() : null,
        })
      }}
      onResetAction={() => {
        setFilters({ startDate: null, endDate: null })
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
