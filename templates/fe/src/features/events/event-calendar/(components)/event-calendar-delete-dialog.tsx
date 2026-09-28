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
import type { CalendarEvent } from '@/features/events/event-calendar/(hooks)/use-event-calendar-data'

type Props = {
  event: CalendarEvent | null
  onClose: () => void
  onConfirm: (event: CalendarEvent) => void
}

export function EventCalendarDeleteDialog({ event, onClose, onConfirm }: Props) {
  const t = useTranslations('events.list')

  return (
    <AlertDialog open={!!event} onOpenChange={(open) => { if (!open) onClose() }}>
      <AlertDialogContent onClose={onClose}>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteDialogTitle')}</AlertDialogTitle>
          <AlertDialogDescription>{t('deleteDialogDescription')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('deleteDialogCancel')}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => event && onConfirm(event)}
          >
            {t('deleteDialogConfirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
