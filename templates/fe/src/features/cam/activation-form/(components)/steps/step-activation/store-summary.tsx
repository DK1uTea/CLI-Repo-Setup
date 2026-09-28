'use client'

import { PencilIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useStoreDetail } from '../../../(hooks)/use-store-detail'

type Props = {
  storeId: string
  onEdit: () => void
}

export function StoreSummary({ storeId, onEdit }: Props) {
  const t = useTranslations('activationForm.store')
  const { data: store, isLoading } = useStoreDetail(storeId)

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-4 w-56" />
      </div>
    )
  }

  if (!store) return null

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <p className="font-semibold text-foreground">{store.storeName}</p>
          <p className="text-sm text-foreground">{store.storeAddress}</p>
          <p className="text-sm text-muted-foreground">
            {store.contactName}
            {store.contactPhone && <> · {store.contactPhone}</>}
            {store.contactEmail && <> · {store.contactEmail}</>}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground"
          aria-label={t('editStore')}
          onClick={onEdit}
        >
          <PencilIcon className="size-4" />
        </Button>
      </div>
    </div>
  )
}
