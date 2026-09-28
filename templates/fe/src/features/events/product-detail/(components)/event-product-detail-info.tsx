'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/ui/button';
import { Switch } from '@/shared/components/ui/switch';
import { useCurrency, useDateFormat } from '@/shared/stores/use-user-store';
import { formatDate } from '@/lib/date-utils';
import { useEventCartStore } from '@/features/events/(stores)/use-event-cart-store';
import { QuantitySelector } from '@/shared/components/ui/quantity-selector';
import { useAddProductToEvent } from '@/features/events/event-form/(hooks)/use-add-product-to-event';
import type { EventMutationRefreshScope } from '@/features/events/event-form/(helpers)/event-mutation-refresh';
import { toast } from 'sonner';
import type { EventProductDetail } from '../(hooks)/use-event-product-detail';
import { useQueryState, parseAsString } from 'nuqs';
import { useEventDetailStore } from '@/features/events/(stores)/use-event-detail-store';
import { EventProductDetailDownloadPdf } from './event-product-detail-download-pdf';
import { hasDisplayValue } from '@/features/rent/product-detail/(helpers)/product-detail-display';
import { ProductDetailInfoShell, type ProductDetailInfoRow } from '@/features/rent/product-detail/(components)/product-detail-info-shell';

type Props = { product: EventProductDetail };

export function EventProductDetailInfo({ product }: Props) {
  const t = useTranslations('events.productDetail');
  const tForm = useTranslations('eventForm');
  const currency = useCurrency();
  const dateFormat = useDateFormat();
  const { cart, addToCart, isOpen, toggleCart } = useEventCartStore();
  const refreshScope: EventMutationRefreshScope = { type: 'product-detail', slug: product.slug };
  const { mutate: addProductToEvent, isPending: isAddingToEvent } = useAddProductToEvent({ refreshScope });
  const [quantity, setQuantity] = useState(1);
  const [reserveAll, setReserveAll] = useState(true);

  const [eventIdParam] = useQueryState('eventId', parseAsString);
  const canEdit = useEventDetailStore((state) => state.canEdit);
  const isDisableField = canEdit === false;

  const isRental = product.productType === 'rental';
  const hasSetupTeardown = !!(product.setUpStartDate || product.teardownEndDate);

  const displayStart = reserveAll && product.setUpStartDate ? product.setUpStartDate : product.startDate;
  const displayEnd = reserveAll && product.teardownEndDate ? product.teardownEndDate : product.endDate;

  const handleAdd = () => {
    if (!eventIdParam) {
      toast.error(tForm('productCatalog.errorOverviewRequired'));
      return;
    }
    if (!product.sku) {
      toast.error(tForm('productCatalog.errorSkuRequired'));
      return;
    }

    const existingCartItem = cart.find(
      (item) => (product.sku && item.sku === product.sku) || item.id === product.id
    );
    const existingQuantity = existingCartItem ? existingCartItem.quantity : 0;
    const apiQuantity = existingQuantity + quantity;

    if (apiQuantity > product.availableQuantity) {
      toast.error(
        tForm('productCatalog.errorExceedsAvailable', {
          existing: existingQuantity,
          remaining: Math.max(product.availableQuantity - existingQuantity, 0),
        }),
      );
      return;
    }

    addProductToEvent(
      {
        eventId: eventIdParam,
        sku: product.sku,
        quantity: apiQuantity,
        isRentEntirePeriod: reserveAll,
      },
      {
        onSuccess: () => {
          addToCart({
            id: product.id,
            sku: product.sku,
            name: product.name,
            thumbnail: product.image_url,
            quantity,
            price: product.price,
            isRental,
            maxQuantity: product.availableQuantity,
            availableQuantity: product.availableQuantity,
            isNew: product.isNew,
            slug: product.slug,
          });
          setQuantity(1);
          if (!isOpen) {
            toggleCart();
          }
        },
      }
    );
  };

  const descriptiveDetails: ProductDetailInfoRow[] = [
    { label: t('category'), value: product.category },
    { label: t('branding'), value: product.brand },
    { label: t('manufacturer'), value: product.manufacturer },
    { label: t('materialType'), value: product.material },
    { label: t('shippingMethod'), value: product.shippingMethod },
  ].filter((detail): detail is ProductDetailInfoRow => hasDisplayValue(detail.value));

  return (
    <ProductDetailInfoShell
      name={product.name}
      downloadPdfButton={<EventProductDetailDownloadPdf product={product} />}
      availableQuantity={product.availableQuantity}
      totalQuantity={product.quantity}
      priceLabel={t('minRentalPrice')}
      price={product.price}
      currencySymbol={currency.symbol}
      descriptiveDetails={descriptiveDetails}
      t={t as (key: string) => string}
      actionArea={
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">{t('startDate')}</p>
              <div className="flex h-10 items-center rounded-detail-field border border-input bg-background px-4 text-sm font-medium" translate="no">
                {formatDate(displayStart, dateFormat)}
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">{t('endDate')}</p>
              <div className="flex h-10 items-center rounded-detail-field border border-input bg-background px-4 text-sm font-medium" translate="no">
                {formatDate(displayEnd, dateFormat)}
              </div>
            </div>
          </div>

          {isRental && hasSetupTeardown && (
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">{t('reserveTitle')}</p>
                <p className="mt-0.5 max-w-xs text-xs text-muted-foreground">{t('reserveDesc')}</p>
              </div>
              <Switch checked={reserveAll} onCheckedChange={setReserveAll} disabled={isDisableField} />
            </div>
          )}

          <div className="flex gap-3">
            <QuantitySelector
              value={quantity}
              min={1}
              max={product.availableQuantity}
              onIncrease={() => setQuantity((q) => Math.min(product.availableQuantity, q + 1))}
              onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
              onChange={setQuantity}
              disabled={isDisableField || isAddingToEvent}
              className="border border-input"
            />
            <Button
              data-testid="product-detail-add-to-event-button"
              className="flex-1"
              onClick={handleAdd}
              disabled={product.availableQuantity === 0 || quantity <= 0 || isDisableField || isAddingToEvent}
              isLoading={isAddingToEvent}
            >
              {t('addToEvent')}
            </Button>
          </div>
        </>
      }
    />
  );
}
