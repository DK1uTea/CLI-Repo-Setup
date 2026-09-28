'use client';

import { useTranslations } from 'next-intl';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { Button } from '@/shared/components/ui/button';

type Props = {
  open: boolean;
  onLeaveEvent: () => void;
  onStay: () => void;
  onCreateOrder: () => void;
  isPending?: boolean;
};

export function EventFormCartChangedDialog({
  open,
  onLeaveEvent,
  onStay,
  onCreateOrder,
  isPending,
}: Props) {
  const t = useTranslations('eventForm.cartChangedDialog');

  return (
    <AlertDialog open={open} onOpenChange={(next) => { if (!next) onStay(); }}>
      <AlertDialogContent className="sm:max-w-xl!">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('description')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="ghost-primary" onClick={onLeaveEvent} disabled={isPending}>
            {t('leaveEvent')}
          </Button>
          <Button variant="ghost-primary" onClick={onStay} disabled={isPending}>
            {t('stayOnPage')}
          </Button>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onCreateOrder();
            }}
            disabled={isPending}
          >
            {isPending ? t('creatingOrder') : t('createNewOrder')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
