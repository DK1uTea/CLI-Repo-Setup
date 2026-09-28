'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { parseAsString, useQueryStates } from 'nuqs'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { useEventFilterConfig } from '../(hooks)/use-event-filter-config'

export function EventListTargetAudienceFilter() {
  const t = useTranslations('events.list')
  const [open, setOpen] = useState(false)
  const { data: config } = useEventFilterConfig()

  const [{ targetAudience }, setFilters] = useQueryStates({
    targetAudience: parseAsString,
  })

  const [localSelected, setLocalSelected] = useState<string[]>([])

  const targetAudienceOptions = config?.targetAudience ?? []

  function handleOpenChange(isOpen: boolean) {
    if (isOpen) {
      setLocalSelected(targetAudience?.split(',').filter(Boolean) ?? [])
    }
    setOpen(isOpen)
  }

  function toggle(value: string) {
    setLocalSelected((prev) =>
      prev.includes(value) ? prev.filter((o) => o !== value) : [...prev, value],
    )
  }

  function handleApply() {
    setFilters({ targetAudience: localSelected.join(',') || null })
    setOpen(false)
  }

  function handleReset() {
    setLocalSelected([])
    setFilters({ targetAudience: null })
    setOpen(false)
  }

  const isActive = !!targetAudience

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-8 max-w-44 gap-1 bg-card text-sm font-semibold',
            isActive &&
              'border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
          )}
        >
          {t('filterTargetAudience')}
          <ChevronDown className="size-3.5 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52 p-2">
        <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto _custom-scroll">
          {targetAudienceOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggle(option.value)}
              className={cn(
                'w-full rounded px-2 py-1.5 text-left text-sm transition-colors',
                localSelected.includes(option.value)
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-end gap-2 border-t pt-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            {t('reset')}
          </Button>
          <Button size="sm" onClick={handleApply}>
            {t('apply')}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
