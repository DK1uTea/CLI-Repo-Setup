'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown, Search, AlignLeft } from 'lucide-react'

import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/shared/components/ui/input-group'
import { QuestionType } from '@/features/reporting-tool/(helpers)/survey-detail-type'
import { getQuestionTypeTranslation } from '../../../(helpers)/survey-question-type-helper'
import { cn } from '@/lib/utils'
import { TYPE_ICONS, QUESTION_GROUPS } from './question-type-picker.constants'

type Props = {
  value: QuestionType
  onChange: (type: QuestionType) => void
  disabled?: boolean
}

export default function QuestionTypePicker({ value, onChange, disabled }: Props) {
  const t = useTranslations('reportingTool')
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  const getTranslatedInfo = (qt: QuestionType) => {
    return getQuestionTypeTranslation(qt, t, { scoped: true })
  }

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => searchRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    } else {
      setSearch('')
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement
      if (target && typeof target.closest === 'function' && target.closest('[data-slot="popover-content"]')) {
        return
      }
      setOpen(false)
    }

    window.addEventListener('scroll', handleScroll, { capture: true, passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true })
    }
  }, [open])

  const filteredGroups = search.trim()
    ? [
      {
        groupKey: null,
        types: (Object.keys(TYPE_ICONS) as QuestionType[]).filter(
          qt =>
            (getTranslatedInfo(qt).label.toLowerCase().includes(search.toLowerCase()) ||
              getTranslatedInfo(qt).description.toLowerCase().includes(search.toLowerCase()))
        )
      }
    ]
    : QUESTION_GROUPS.map(group => {
      if (group.groupKey === 'most_used') {
        const withoutSelected = group.types.filter(qt => qt !== value)
        const hasValue = group.types.includes(value)
        const types = hasValue ? [value, ...withoutSelected] : [value, ...group.types]
        return { ...group, types }
      }
      return { ...group, types: group.types.filter(qt => qt !== value) }
    }).filter(group => group.types.length > 0)

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          disabled={disabled}
          variant="outline"
          className={cn(
            "w-full flex items-center justify-between gap-3 px-3 h-12 rounded-xl text-left font-normal hover:bg-accent/50 transition-colors",
            open && "ring-1 ring-ring border-ring"
          )}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className='text-primary shrink-0 w-8 h-8 flex items-center justify-center border border-input rounded-lg bg-background'>
              {TYPE_ICONS[value] || <AlignLeft size={15} />}
            </span>
            <div className='grow flex flex-col items-start min-w-0 flex-1'>
              <span className='text-sm font-medium text-foreground truncate w-full'>{getTranslatedInfo(value).label}</span>
              <span className='text-sm text-muted-foreground truncate w-full'>{getTranslatedInfo(value).description}</span>
            </div>
          </div>
          <ChevronDown size={16} className={cn("text-muted-foreground transition-transform shrink-0", open && "rotate-180")} />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) max-h-105 p-0 overflow-hidden"
      >
        {/* Search */}
        <div className="flex items-center gap-2 p-3 border-b bg-popover sticky top-0 z-10">
          <InputGroup className="w-full bg-background h-10">
            <InputGroupAddon>
              <Search size={16} className="text-muted-foreground shrink-0" />
            </InputGroupAddon>
            <InputGroupInput
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('questionTypePicker.searchPlaceholder')}
            />
          </InputGroup>
        </div>

        {/* List */}
        <div className="_custom-scroll overflow-y-auto p-3 space-y-4 max-h-85">
          {filteredGroups.map((group) => (
            <div key={group.groupKey ?? 'search-results'} className="space-y-1.5">
              {group.groupKey && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 pl-1">
                  {t(`questionGroups.${group.groupKey}` as any)}
                </p>
              )}
              {group.types.map(qt => {
                const selected = qt === value
                const { label, description } = getTranslatedInfo(qt)

                return (
                  <Button
                    key={qt}
                    type='button'
                    variant="ghost"
                    onClick={() => {
                      onChange(qt)
                      setOpen(false)
                    }}
                    className={cn(
                      "w-full flex items-center justify-start gap-3 px-3 py-2 h-auto text-left rounded-lg transition-colors font-normal whitespace-normal",
                      selected ? "bg-accent border border-primary/20" : "bg-background border border-background"
                    )}
                  >
                    <span className="shrink-0 w-8 h-8 flex items-center justify-center bg-background border rounded-md text-primary">
                      {TYPE_ICONS[qt] || <AlignLeft size={15} />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none text-foreground">{label}</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{description}</p>
                    </div>
                    {selected && (
                      <Badge className="shrink-0 text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/10 border-transparent uppercase px-1.5 py-0.5 rounded text-xs">
                        {t('questionTypePicker.selected')}
                      </Badge>
                    )}
                  </Button>
                )
              })}
            </div>
          ))}
          {(filteredGroups.length === 0 || (filteredGroups.length === 1 && filteredGroups[0].types.length === 0)) && (
            <p className="p-4 text-sm text-muted-foreground text-center">{t('questionTypePicker.noResults')}</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
