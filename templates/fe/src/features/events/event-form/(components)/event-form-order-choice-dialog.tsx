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
  onStay: () => void;
  onReactivate: () => void;
  onCreateOrder: () => void;
  isPending?: boolean;
  isCreatingOrder?: boolean;
};

export function EventFormOrderChoiceDialog({
  open,
  onStay,
  onReactivate,
  onCreateOrder,
  isPending,
  isCreatingOrder,
}: Props) {
  const t = useTranslations('eventForm.orderChoiceDialog');
  const disabled = isPending || isCreatingOrder;

  return (
    <AlertDialog open={open} onOpenChange={(next) => { if (!next) onStay(); }}>
      <AlertDialogContent className="sm:max-w-2xl!">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('description')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button data-testid="event-form-order-choice-stay-button" variant="outline" onClick={onStay} disabled={disabled}>
            {t('stayOnPage')}
          </Button>
          <Button data-testid="event-form-order-choice-create-button" variant="outline" onClick={onCreateOrder} disabled={disabled}>
            {isCreatingOrder ? t('creatingOrder') : t('createOrder')}
          </Button>
          <AlertDialogAction
            data-testid="event-form-order-choice-reactivate-button"
            onClick={(e) => {
              e.preventDefault();
              onReactivate();
            }}
            disabled={disabled}
          >
            {isPending ? t('reactivating') : t('reactivateOrder')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
