'use client'

import { useTranslations } from 'next-intl'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/shared/components/ui/alert-dialog'
type Props<TEvent extends { id: string }> = {
  event: TEvent | null
  onClose: () => void
  onConfirm: (event: TEvent) => void
  isPending?: boolean
}

export function EventListDeleteDialog<TEvent extends { id: string }>({
  event,
  onClose,
  onConfirm,
  isPending,
}: Props<TEvent>) {
  const t = useTranslations('events.list')

  return (
    <AlertDialog open={!!event} onOpenChange={(open) => { if (!open && !isPending) onClose() }}>
      <AlertDialogContent onClose={isPending ? undefined : onClose}>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteDialogTitle')}</AlertDialogTitle>
          <AlertDialogDescription>{t('deleteDialogDescription')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{t('deleteDialogCancel')}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={() => event && onConfirm(event)}
          >
            {t('deleteDialogConfirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
