'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/shared/components/ui/button'

type Props = {
  title: string
  onPrevAction: () => void
  onNextAction: () => void
  onTodayAction: () => void
}

export function EventCalendarNav({ title, onPrevAction, onNextAction, onTodayAction }: Props) {
  const t = useTranslations('events.calendar')

  return (
    <div className="flex items-center gap-3">
      <Button variant="outline-primary" size="sm" className="h-8 bg-card" onClick={onTodayAction}>
        {t('today')}
      </Button>
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={onPrevAction}>
          <ChevronLeft className="size-6" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onNextAction}>
          <ChevronRight className="size-6" />
        </Button>
      </div>
      <h3 className="text-sm font-semibold" translate="no">{title}</h3>
    </div>
  )
}
