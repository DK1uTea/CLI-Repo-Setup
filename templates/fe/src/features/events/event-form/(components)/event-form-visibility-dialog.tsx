'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPrivate: boolean;
  isPending?: boolean;
};

export function EventFormVisibilityDialog({
  open,
  onOpenChange,
  onConfirm,
  isPrivate,
  isPending,
}: Props) {
  const t = useTranslations('eventForm.visibilityConfirm');

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isPrivate ? t('publicTitle') : t('privateTitle')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isPrivate ? t('publicDescription') : t('privateDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{t('cancel')}</AlertDialogCancel>
          <Button type="button" isLoading={isPending} onClick={onConfirm}>
            {isPrivate ? t('confirmPublic') : t('confirmPrivate')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
