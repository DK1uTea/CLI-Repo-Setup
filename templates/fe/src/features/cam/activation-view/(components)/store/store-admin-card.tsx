'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { formatDate } from '@/lib/date-utils'
import { useDateFormat } from '@/shared/stores/use-user-store'
import { StoreStatusBadge } from './store-status-badge'
import { StoreRowActions } from './store-row-actions'
import type { StoreAdminItem } from '../../(hooks)/use-admin-store-list'

type Props = {
  item: StoreAdminItem
  onEdit: (id: string) => void
}

export function StoreAdminCard({ item, onEdit }: Props) {
  const t = useTranslations('activationView')
  const dateFormat = useDateFormat()
  const router = useRouter()

  return (
    <div
      className="rounded-2xl border border-border bg-card p-4 space-y-3 cursor-pointer"
      onClick={() => router.push(`/customer-activation/store/${item.id}`)}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-foreground leading-snug">{item.storeName}</span>
        <div onClick={(e) => e.stopPropagation()}>
          <StoreRowActions
            storeId={item.id}
            storeName={item.storeName}
            status={item.status}
            onViewDetail={() => router.push(`/customer-activation/store/${item.id}`)}
            onEdit={() => onEdit(item.id)}
          />
        </div>
      </div>

      {/* Status */}
      <StoreStatusBadge status={item.status} />

      {/* Address */}
      <p className="text-sm text-muted-foreground">{item.storeAddress}</p>

      {/* Cases count */}
      <p className="text-sm text-foreground">
        {t('store.colCasesNumber')}: <span className="font-medium">{item.activationCount}</span>
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-border text-xs text-muted-foreground">
        <span>
          {t('store.colLastActivity')} {item.updatedAt ? formatDate(item.updatedAt, dateFormat) : '—'}
        </span>
        <span>{item.contactName}</span>
      </div>
    </div>
  )
}
