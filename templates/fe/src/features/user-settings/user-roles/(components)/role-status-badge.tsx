'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

type RoleStatusBadgeProps = {
  status?: string
  className?: string
}

export function RoleStatusBadge({ status, className }: RoleStatusBadgeProps) {
  const t = useTranslations('settings')

  const normalized = status ? status.toUpperCase() : ''

  let variant: 'success' | 'destructive' | 'warning' = 'warning'
  let style = 'bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
  let label = status || 'UNKNOWN'

  if (normalized === 'ACTIVE') {
    variant = 'success'
    style = 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
    label = t('statusActive')
  } else if (normalized === 'INACTIVE') {
    variant = 'destructive'
    style = 'bg-destructive/10 text-destructive dark:bg-destructive/20'
    label = t('statusInactive')
  }

  return (
    <span
      data-variant={variant}
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap uppercase',
        style,
        className
      )}
    >
      {label}
    </span>
  )
}
