'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/shared/components/ui/card'
import { useEventAnalyticStat } from '../(hooks)/use-event-analytic-stat'
import EventAnalyticStatsSkeleton from './event-analytic-stats-skeleton'

type StatItem = {
  labelKey: 'completedEvents' | 'incompleteEvents' | 'totalEvents'
  valueKey: 'completed' | 'incomplete' | 'total'
}

const STAT_ITEMS: StatItem[] = [
  { labelKey: 'completedEvents', valueKey: 'completed' },
  { labelKey: 'incompleteEvents', valueKey: 'incomplete' },
  { labelKey: 'totalEvents', valueKey: 'total' },
]

const EventAnalyticStats = () => {
  const t = useTranslations('events.analytics.stats')
  const { data: res, isLoading } = useEventAnalyticStat()

  if (isLoading) return <EventAnalyticStatsSkeleton />

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {STAT_ITEMS.map((item) => {
        const value = res?.[item.valueKey]
        const hasData = typeof value === 'number'

        return (
          <Card key={item.valueKey} className="min-h-40 p-5 text-center">
            <CardContent className="flex h-full flex-col items-center justify-center gap-3 p-0">
              <p className="flex h-12 items-center justify-center text-base leading-6">{t(item.labelKey)}</p>
              {hasData ? (
                <p className="text-5xl font-light leading-none text-foreground">{value}</p>
              ) : (
                <p className="text-base text-muted-foreground">{t('noData')}</p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default EventAnalyticStats
