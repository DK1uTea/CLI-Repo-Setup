'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { parseAsString, useQueryStates } from 'nuqs'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { PartnershipTypeConfigItem } from '../(hooks)/use-event-filter-config'

type Props = {
  partnerships: PartnershipTypeConfigItem[]
}

export function EventListPartnershipFilter({ partnerships }: Props) {
  const t = useTranslations('events.list')
  const [open, setOpen] = useState(false)

  const [{ partnershipTypes, productPartnerCategories }, setFilters] = useQueryStates({
    partnershipTypes: parseAsString,
    productPartnerCategories: parseAsString,
  })

  const [localTypes, setLocalTypes] = useState<string[]>([])
  const [localCategories, setLocalCategories] = useState<string[]>([])

  function handleOpenChange(isOpen: boolean) {
    if (isOpen) {
      setLocalTypes(partnershipTypes?.split(',').filter(Boolean) ?? [])
      setLocalCategories(productPartnerCategories?.split(',').filter(Boolean) ?? [])
    }
    setOpen(isOpen)
  }

  function toggleType(value: string) {
    const partner = partnerships.find((p) => p.value === value)
    if (localTypes.includes(value)) {
      setLocalTypes(localTypes.filter((k) => k !== value))
      if (partner?.categories?.length) {
        const catValues = partner.categories.map((c) => c.value)
        setLocalCategories(localCategories.filter((c) => !catValues.includes(c)))
      }
    } else {
      setLocalTypes([...localTypes, value])
    }
  }

  function toggleCategory(typeValue: string, catValue: string) {
    if (localCategories.includes(catValue)) {
      setLocalCategories(localCategories.filter((c) => c !== catValue))
    } else {
      setLocalCategories([...localCategories, catValue])
      if (!localTypes.includes(typeValue)) setLocalTypes([...localTypes, typeValue])
    }
  }

  function handleApply() {
    setFilters({
      partnershipTypes: localTypes.join(',') || null,
      productPartnerCategories: localCategories.join(',') || null,
    })
    setOpen(false)
  }

  function handleReset() {
    setLocalTypes([])
    setLocalCategories([])
    setFilters({ partnershipTypes: null, productPartnerCategories: null })
    setOpen(false)
  }

  const isActive = !!partnershipTypes || !!productPartnerCategories

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
        <div className="flex h-42 min-h-0 shrink-0 flex-col gap-3 overflow-y-auto _custom-scroll">
          {partnerships.map((partner) => (
            <div key={partner.value} className="flex flex-col gap-2 px-2">
              <label className="flex cursor-pointer select-none items-center gap-2">
                <Checkbox
                  checked={localTypes.includes(partner.value)}
                  onCheckedChange={() => toggleType(partner.value)}
                />
                <span className="text-sm font-medium" translate="no">{partner.label}</span>
              </label>
              {(partner.categories?.length ?? 0) > 0 && localTypes.includes(partner.value) && (
                <div className="ml-8 flex flex-col gap-2 border-l-2 border-border pl-3">
                  {partner.categories?.map((cat) => (
                    <label key={cat.value} className="flex cursor-pointer select-none items-center gap-2">
                      <Checkbox
                        checked={localCategories.includes(cat.value)}
                        onCheckedChange={() => toggleCategory(partner.value, cat.value)}
                      />
                      <span className="text-sm" translate="no">{cat.label}</span>
                    </label>
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
