'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { parseAsArrayOf, parseAsString, useQueryStates } from 'nuqs'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Label } from '@/shared/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import type { PartnershipTypeConfigItem } from '@/features/events/event-list/(hooks)/use-event-filter-config'

type Props = {
  partnerships: PartnershipTypeConfigItem[]
}

export function CalendarListPartnershipFilter({ partnerships }: Props) {
  const t = useTranslations('calendarList')
  const [open, setOpen] = useState(false)

  const [{ partnershipTypes, productPartnerCategories }, setFilters] = useQueryStates({
    partnershipTypes: parseAsArrayOf(parseAsString),
    productPartnerCategories: parseAsArrayOf(parseAsString),
  })

  const [localTypes, setLocalTypes] = useState<string[]>([])
  const [localCategories, setLocalCategories] = useState<string[]>([])

  function handleOpenChange(isOpen: boolean) {
    if (isOpen) {
      setLocalTypes(partnershipTypes ?? [])
      setLocalCategories(productPartnerCategories ?? [])
    }
    setOpen(isOpen)
  }

  function toggleType(value: string) {
    const partner = partnerships.find((item) => item.value === value)
    if (localTypes.includes(value)) {
      setLocalTypes(localTypes.filter((item) => item !== value))
      const categoryValues = partner?.categories?.map((category) => category.value) ?? []
      setLocalCategories(localCategories.filter((category) => !categoryValues.includes(category)))
    } else {
      setLocalTypes([...localTypes, value])
    }
  }

  function toggleCategory(typeValue: string, categoryValue: string) {
    if (localCategories.includes(categoryValue)) {
      setLocalCategories(localCategories.filter((category) => category !== categoryValue))
    } else {
      setLocalCategories([...localCategories, categoryValue])
      if (!localTypes.includes(typeValue)) setLocalTypes([...localTypes, typeValue])
    }
  }

  function handleApply() {
    setFilters({
      partnershipTypes: localTypes.length ? localTypes : null,
      productPartnerCategories: localCategories.length ? localCategories : null,
    })
    setOpen(false)
  }

  function handleReset() {
    setLocalTypes([])
    setLocalCategories([])
    setFilters({ partnershipTypes: null, productPartnerCategories: null })
    setOpen(false)
  }

  const isActive = !!partnershipTypes?.length || !!productPartnerCategories?.length

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-8 max-w-40 gap-1 bg-card text-sm font-semibold',
            isActive &&
              'border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
          )}
        >
          {t('filterPartnership')}
          <ChevronDown className="size-3.5 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 max-h-none! overflow-visible! p-2">
        <div className="flex h-38 min-h-0 shrink-0 flex-col gap-2 overflow-y-auto _custom-scroll">
          {partnerships.map((partner) => (
            <div key={partner.value} className="flex flex-col gap-2 px-2">
              <Label
                htmlFor={`calendar-partnership-${partner.value}`}
                className="flex cursor-pointer select-none items-center gap-2"
              >
                <Checkbox
                  id={`calendar-partnership-${partner.value}`}
                  checked={localTypes.includes(partner.value)}
                  onCheckedChange={() => toggleType(partner.value)}
                />
                <span className="text-sm font-medium" translate="no">{partner.label}</span>
              </Label>
              {!!partner.categories?.length && localTypes.includes(partner.value) && (
                <div className="ml-8 flex flex-col gap-2 border-l-2 border-border pl-3">
                  {partner.categories.map((category) => (
                    <Label
                      key={category.value}
                      htmlFor={`calendar-partnership-category-${category.value}`}
                      className="flex cursor-pointer select-none items-center gap-2"
                    >
                      <Checkbox
                        id={`calendar-partnership-category-${category.value}`}
                        checked={localCategories.includes(category.value)}
                        onCheckedChange={() => toggleCategory(partner.value, category.value)}
                      />
                      <span className="text-sm" translate="no">{category.label}</span>
                    </Label>
                  ))}
                </div>
              )}
            </div>
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
