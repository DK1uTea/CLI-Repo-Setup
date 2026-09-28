'use client'

import { useTranslations } from 'next-intl'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'

type Props = {
  open: boolean
  isActive: boolean
  storeName: string
  isPending: boolean
  isConfirmDisabled: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function StoreStatusConfirmDialog({
  open,
  isActive,
  storeName,
  isPending,
  isConfirmDisabled,
  onOpenChange,
  onConfirm,
}: Props) {
  const t = useTranslations('activationView.store')

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isActive ? t('confirmDisableTitle') : t('confirmEnableTitle')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isActive
              ? t('confirmDisableDescription', { storeName })
              : t('confirmEnableDescription', { storeName })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            variant={isActive ? 'destructive' : 'default'}
            disabled={isConfirmDisabled}
            onClick={onConfirm}
          >
            {isActive ? t('actionDisable') : t('actionEnable')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
