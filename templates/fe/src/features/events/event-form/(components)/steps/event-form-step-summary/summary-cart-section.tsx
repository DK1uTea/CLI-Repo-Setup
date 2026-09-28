'use client';

import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { useEventCartStore } from '@/features/events/(stores)/use-event-cart-store';
import { useCurrency } from '@/shared/stores/use-user-store';
import { EventCartList } from '@/features/events/(components)/event-cart-list';
import { SummaryInfoTable } from './summary-info-table';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/shared/components/ui/empty';
import { ShoppingCartIcon } from 'lucide-react';
import { useQueryState, parseAsString } from 'nuqs';
import { useQueryClient } from '@tanstack/react-query';
import type { EventDetail } from '@/features/events/event-form/(hooks)/use-event-step-detail';
import { useRemoveProductFromEvent } from '@/features/events/event-form/(hooks)/use-remove-product-from-event';
import { useAddProductToEvent } from '@/features/events/event-form/(hooks)/use-add-product-to-event';
import { toast } from 'sonner';
import type { EventFormDto } from '../../../(helpers)/event-form-schema';

export function SummaryCartSection() {
  const t = useTranslations('eventForm');
  const tCommon = useTranslations('common');
  const { control } = useFormContext<EventFormDto>();
  const helpingHandComment = useWatch({ control, name: 'helpingHandComment' }) ?? '';
  const { cart, removeFromCart, updateQuantity } = useEventCartStore();
  const currency = useCurrency();
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const [eventIdParam] = useQueryState('eventId', parseAsString);
  const { mutate: removeProductFromEvent } = useRemoveProductFromEvent();
  const { mutate: addProductToEvent } = useAddProductToEvent({
    refreshScope: { type: 'cart' },
    errorMessageKey: 'errorUpdateQuantity',
  });
  const queryClient = useQueryClient();

  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) return;
    const item = cart[index];
    if (!item) return;

    if (!eventIdParam) {
      toast.error(t('productCatalog.errorOverviewRequired'));
      return;
    }
    if (!item.sku) {
      toast.error(t('productCatalog.errorSkuRequired'));
      return;
    }

    addProductToEvent(
      {
        eventId: eventIdParam,
        sku: item.sku,
        quantity: newQty,
        isRentEntirePeriod: true,
      },
      {
        onSuccess: () => {
          updateQuantity(index, newQty);
        },
      }
    );
  };
  const resData = queryClient.getQueryData<EventDetail>(['event-step-detail', eventIdParam || '', 'summary']);
  const costSummary = resData?.costSummary;

  const rentalTotal = cart.reduce((acc, item) => (item.isRental ? acc + item.price * item.quantity : acc), 0);
  const purchaseTotal = cart.reduce((acc, item) => (!item.isRental ? acc + item.price * item.quantity : acc), 0);

  const rentalCost = costSummary ? costSummary.equipmentRental : rentalTotal;
  const purchaseCost = costSummary ? costSummary.purchasedItems : purchaseTotal;
  const serviceCost = costSummary ? costSummary.services : 0;
  const transportCost = costSummary ? costSummary.transportCosts : 0;
  const pmCost = costSummary ? costSummary.pmCost : 0;
  const totalCost = costSummary ? costSummary.totalEventCost : (rentalTotal + purchaseTotal);
  const hasHelpingHandComment = helpingHandComment.replace(/<[^>]*>/g, '').trim().length > 0;

  const sym = currency.symbol;
  const costRows = [
    { label: t('summary.rentalCost'), value: `${rentalCost.toFixed(2)} ${sym}` },
    { label: t('summary.purchaseCost'), value: `${purchaseCost.toFixed(2)} ${sym}` },
    { label: t('summary.services'), value: `${serviceCost.toFixed(2)} ${sym}` },
    { label: t('summary.transportCosts'), value: `${transportCost.toFixed(2)} ${sym}` },
    { label: t('summary.pmCost'), value: `${pmCost.toFixed(2)} ${sym}` },
    { label: t('summary.totalEventCost'), value: `${totalCost.toFixed(2)} ${sym}` },
  ];

  return (
    <>
      {cart.length === 0 ? (
        <Empty>
          <EmptyMedia>
            <ShoppingCartIcon className="size-24 text-primary opacity-40" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>{t('summary.noProducts')}</EmptyTitle>
            <EmptyDescription>{t('summary.noProductsDescription')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <EventCartList
          items={cart}
          onDelete={(i) => setDeleteIndex(i)}
          onIncrease={(i) => handleUpdateQuantity(i, cart[i].quantity + 1)}
          onDecrease={(i) => handleUpdateQuantity(i, cart[i].quantity - 1)}
          onSubmitQuantity={(i, quantity) => handleUpdateQuantity(i, quantity)}
        />
      )}

      {hasHelpingHandComment && (
        <SummaryInfoTable
          className="mt-6"
          rows={[{
            label: t('helpingHands.commentTitle'),
            value: helpingHandComment,
            html: true,
          }]}
        />
      )}

      <div className="mt-6 space-y-3">
        <p className="text-base font-medium">{t('summary.totalCost')}</p>
        <SummaryInfoTable rows={costRows} />
      </div>

      <AlertDialog open={deleteIndex !== null} onOpenChange={(open) => !open && setDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tCommon('deleteCartItem')}</AlertDialogTitle>
            <AlertDialogDescription>{tCommon('deleteCartItemDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteIndex !== null) {
                  const item = cart[deleteIndex];
                  if (item && item.sku) {
                    if (eventIdParam) {
                      removeProductFromEvent(
                        { eventId: eventIdParam, sku: item.sku },
                        {
                          onSuccess: () => {
                            removeFromCart(deleteIndex);
                          },
                        }
                      );
                    } else {
                      removeFromCart(deleteIndex);
                    }
                  }
                  setDeleteIndex(null);
                }
              }}
            >
              {tCommon('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
