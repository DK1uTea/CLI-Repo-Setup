'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { OptionMenu } from '@/shared/components/ui/option-menu'
import { useToggleAdminStoreStatus } from '../../(hooks)/use-admin-store-actions'
import { StoreStatusConfirmDialog } from './store-status-confirm-dialog'
import { Ellipsis } from 'lucide-react'

type Props = {
  storeId: string
  storeName: string
  status: string
  onViewDetail: () => void
  onEdit: () => void
}

export function StoreRowActions({ storeId, storeName, status, onViewDetail, onEdit }: Props) {
  const t = useTranslations('activationView')
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const { mutate: toggleStatus, isPending } = useToggleAdminStoreStatus()
  const isActive = status === 'ACTIVE'

  return (
    <>
      <OptionMenu
        triggerIcon={<Ellipsis className="size-4" />}
        items={[
          { key: 'view-cases', label: t('store.actionViewCases'), onClick: onViewDetail },
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
      <StoreStatusConfirmDialog
        open={isConfirmOpen}
        isActive={isActive}
        storeName={storeName}
        isPending={isPending}
        isConfirmDisabled={isPending}
        onOpenChange={setIsConfirmOpen}
        onConfirm={() =>
          toggleStatus(
            { id: storeId, currentStatus: status },
            {
              onSuccess: () =>
                toast.success(
                  isActive ? t('store.disableSuccess') : t('store.enableSuccess'),
                ),
            },
          )
        }
      />
    </>
  )
}
