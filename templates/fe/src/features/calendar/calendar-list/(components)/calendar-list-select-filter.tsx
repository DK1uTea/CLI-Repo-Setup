'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'

type Option = { value: string; label: string }

type Props = {
  label: string
  value: string | null | undefined
  options: Option[]
  onChange: (value: string) => void
  isActive?: boolean
  icon?: React.ReactNode
  triggerLabel?: string
}

export function CalendarListSelectFilter({
  label,
  value,
  options,
  onChange,
  isActive,
  icon,
  triggerLabel,
}: Props) {
  const [open, setOpen] = useState(false)
  const active = isActive ?? (!!value && value !== 'all')
  const displayLabel = triggerLabel ?? options.find((o) => o.value === value)?.label ?? label

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-8 max-w-40 gap-2 bg-card text-sm font-semibold',
            active &&
            'border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
          )}
        >
          {icon}
          <span className="min-w-0 truncate">{displayLabel}</span>
          <ChevronDown className="size-3.5 shrink-0 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48 p-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => { onChange(opt.value); setOpen(false) }}
            className={cn(
              'w-full rounded px-3 py-1.5 text-left text-sm transition-colors',
              value === opt.value || (!value && opt.value === 'all')
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted',
            )}
          >
            {opt.label}
          </button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
