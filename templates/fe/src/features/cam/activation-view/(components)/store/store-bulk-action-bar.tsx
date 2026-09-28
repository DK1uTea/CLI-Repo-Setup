'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

type Props = {
  selectedCount: number
  onEnable: () => void
  onDisable: () => void
  isPending: boolean
}

export function StoreBulkActionBar({ selectedCount, onEnable, onDisable, isPending }: Props) {
  const t = useTranslations('activationView')

  return (
    <div className="flex items-center bg-card shadow-md rounded-xl">
      <span className="p-3 text-sm font-medium text-primary border-r border-border">
        {selectedCount} {t('store.selected')}
      </span>
      <span
        onClick={isPending ? undefined : onEnable}
        className={cn(
          'border-r border-border px-3 py-3 text-sm font-medium text-foreground cursor-pointer',
          isPending && 'pointer-events-none opacity-50',
        )}
      >
        {t('store.bulkEnable')}
      </span>
      <span
        onClick={isPending ? undefined : onDisable}
        className={cn(
          'px-3 py-3 text-sm font-medium text-foreground cursor-pointer',
          isPending && 'pointer-events-none opacity-50',
        )}
      >
        {t('store.bulkDisable')}
      </span>
    </div>
  )
}
