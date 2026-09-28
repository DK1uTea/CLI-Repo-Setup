'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowLeftIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { OptionMenu } from '@/shared/components/ui/option-menu'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { StoreStatusBadge } from './store-status-badge'
import { StoreActivationsTable } from './store-activations-table'
import { useAdminStoreDetail } from '../../(hooks)/use-admin-store-detail'
import { useToggleAdminStoreStatus } from '../../(hooks)/use-admin-store-actions'
import { useBreadcrumbs } from '@/shared/hooks/common/use-breadcrumbs'
import { StoreStatusConfirmDialog } from './store-status-confirm-dialog'

type Props = {
  storeId: string
  onBack: () => void
  onEdit: () => void
}

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
  )
}

export function StoreAdminDetail({ storeId, onBack, onEdit }: Props) {
  const t = useTranslations('activationView')
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const { store, isLoading } = useAdminStoreDetail(storeId)
  const { mutate: toggleStatus, isPending } = useToggleAdminStoreStatus()

  useBreadcrumbs([
    { label: t('titleAdmin'), href: '/customer-activation' },
    { label: t('admin.tabStore'), href: '/customer-activation?tab=store' },
    { label: store?.storeName ?? '' },
  ])

  if (isLoading) return <DetailSkeleton />

  const contactLine = [store?.contactName, store?.contactPhone, store?.contactEmail]
    .filter(Boolean)
    .join(' · ')

  const isActive = store?.status === 'ACTIVE'

  return (
    <div className="space-y-5">
      {/* Store header card */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon-xl" className="shrink-0 text-primary border border-primary rounded-full" onClick={onBack}>
              <ArrowLeftIcon className="size-4" />
            </Button>
            <h2 className="text-[22px] font-semibold text-foreground truncate">{store?.storeName}</h2>
            {store?.status && <StoreStatusBadge status={store.status} />}
          </div>
          <OptionMenu
            items={[
              { key: 'edit', label: t('store.actionEdit'), onClick: onEdit },
              {
                key: 'toggle-status',
                label: isActive ? t('store.actionDisable') : t('store.actionEnable'),
                destructive: isActive,
                disabled: isPending,
                onClick: () => setIsConfirmOpen(true),
              },
            ]}
          />
        </div>

        <div className="mt-2 space-y-0.5">
          <p className="text-base text-foreground">{store?.storeAddress}</p>
          {contactLine && (
            <p className="text-sm text-muted-foreground mt-1.5">{contactLine}</p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Activations table */}
      <StoreActivationsTable storeId={storeId} />

      <StoreStatusConfirmDialog
        open={isConfirmOpen}
        isActive={isActive}
        storeName={store?.storeName ?? ''}
        isPending={isPending}
        isConfirmDisabled={isPending || !store}
        onOpenChange={setIsConfirmOpen}
        onConfirm={() => {
          if (!store) return
          toggleStatus(
            { id: storeId, currentStatus: store.status },
            {
              onSuccess: () =>
                toast.success(
                  isActive
                    ? t('store.disableSuccess')
                    : t('store.enableSuccess'),
                ),
            },
          )
        }}
      />
    </div>
  )
}
