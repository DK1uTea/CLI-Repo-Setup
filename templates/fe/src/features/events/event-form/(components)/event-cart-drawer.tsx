'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { XIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/shared/components/ui/sheet';
import { Separator } from '@/shared/components/ui/separator';
import { Button } from '@/shared/components/ui/button';
import { useQueryState, parseAsString } from 'nuqs';
import { useEventCartStore } from '@/features/events/(stores)/use-event-cart-store';
import { useEventDetailStore } from '@/features/events/(stores)/use-event-detail-store';
import { useCurrency } from '@/shared/stores/use-user-store';
import { useProductDetailHref, type ProductDetailStep } from '../(hooks)/use-product-detail-href';
import { toast } from 'sonner';
import { useAddProductToEvent } from '../(hooks)/use-add-product-to-event';
import { useRemoveProductFromEvent } from '@/features/events/event-form/(hooks)/use-remove-product-from-event';
import { useEventFormFooter } from '../(hooks)/use-event-form-footer';
import { useSyncEventCart } from '../(hooks)/use-sync-event-cart';
import type { StepName } from '../(helpers)/event-form-schema';
import { isCartEmpty } from '../(helpers)/cart-stock-validation';
import { EventCartContent } from './event-cart-content';
import { EventCartFooter } from './event-cart-footer';
import { EventCartDeleteDialog } from './event-cart-delete-dialog';

export function EventCartDrawer() {
  const t = useTranslations('common');
  const tForm = useTranslations('eventForm');
  const { isOpen, toggleCart, cart, removeFromCart, updateQuantity } = useEventCartStore();
  const currency = useCurrency();
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [eventIdParam] = useQueryState('eventId', parseAsString);
  const [rawStep] = useQueryState('step', parseAsString.withDefault('product_catalog'));
  const step: ProductDetailStep = rawStep === 'helping_hand' ? 'helping_hand' : 'product_catalog';
  const { isLoading: isCartLoading } = useSyncEventCart(eventIdParam || '', rawStep as StepName);
  const getProductDetailHref = useProductDetailHref();

  const canEdit = useEventDetailStore((s) => s.canEdit);
  const isDisableField = eventIdParam ? !canEdit : false;



  const { mutate: addProductToEvent, isPending: isUpdating } = useAddProductToEvent({
    refreshScope: { type: 'cart' },
    errorMessageKey: 'errorUpdateQuantity',
  });
  const { mutate: removeProductFromEvent } = useRemoveProductFromEvent();
  const { onNext, onFinalizeEvent, hasCartChanges, isPending: isFooterPending } = useEventFormFooter('events');

  const handleNext = async () => {
    await onNext();
    toggleCart();
  };

  const handleFinalizeEvent = async () => {
    const finalized = await onFinalizeEvent();
    if (finalized) toggleCart();
  };

  const handleDelete = () => {
    if (deleteIndex === null) return;
    const item = cart[deleteIndex];
    // An item still tied to the active order (actualQuantity > 0) must stay
    // visible after removal — the invalidated cart query refetch brings it
    // back anyway (server keeps returning it as `quantity: 0` so it shows
    // the Deleted state). Splicing it out of the local store immediately
    // would make it vanish and then reappear once that refetch lands.
    const stillInActiveOrder = (item?.actualQuantity ?? 0) > 0;
    if (item?.sku && eventIdParam) {
      removeProductFromEvent(
        { eventId: eventIdParam, sku: item.sku },
        { onSuccess: () => { if (!stillInActiveOrder) removeFromCart(deleteIndex); } },
      );
    } else if (item?.sku && !stillInActiveOrder) {
      removeFromCart(deleteIndex);
    }
    setDeleteIndex(null);
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) return;
    const item = cart[index];
    if (!item) return;

    if (!eventIdParam) {
      toast.error(tForm('productCatalog.errorOverviewRequired'));
      return;
    }
    if (!item.sku) {
      toast.error(tForm('productCatalog.errorSkuRequired'));
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
        onError: (err) => {
          console.error('[EventCartDrawer] addProductToEvent failed:', err);
        }
      }
    );
  };

  const rentalTotal = cart.reduce((acc, item) => (item.isRental ? acc + item.price * item.quantity : acc), 0);
  const purchaseTotal = cart.reduce((acc, item) => (!item.isRental ? acc + item.price * item.quantity : acc), 0);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={toggleCart}>
        <SheetContent
          data-testid="event-cart-drawer"
          side="right"
          showCloseButton={false}
          className="flex flex-col gap-0 p-0"
          style={{ width: '100%', maxWidth: 486 }}
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between px-6 py-5">
            <SheetTitle className="text-base font-semibold">
              {t('cart')} ({cart.length})
            </SheetTitle>
            <Button variant="ghost" size="icon-sm" type="button" onClick={toggleCart} aria-label={t('close')}>
              <XIcon />
            </Button>
          </div>

          <Separator />

          <EventCartContent
            cart={cart}
            isLoading={isCartLoading}
            disabled={isDisableField || isUpdating}
            getItemHref={(item) => getProductDetailHref(item.slug || item.id, step)}
            onDelete={setDeleteIndex}
            onUpdateQuantity={handleUpdateQuantity}
            onNavigate={toggleCart}
          />

          <Separator />

          <EventCartFooter rentalTotal={rentalTotal} purchaseTotal={purchaseTotal}
            currencySymbol={currency.symbol} isPending={isFooterPending}
            disabled={isCartEmpty(cart) || isUpdating} onNext={handleNext}
            hasCartChanges={hasCartChanges} onFinalizeEvent={handleFinalizeEvent} />
        </SheetContent>
      </Sheet>

      <EventCartDeleteDialog open={deleteIndex !== null}
        onOpenChange={(open) => !open && setDeleteIndex(null)} onConfirm={handleDelete} />
    </>
  );
}
