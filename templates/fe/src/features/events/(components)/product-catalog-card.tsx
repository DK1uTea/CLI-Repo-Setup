'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { PackageIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/components/ui/button';
import { QuantitySelector } from '@/shared/components/ui/quantity-selector';
import { useCurrency } from '@/shared/stores/use-user-store';
import { useEventCartStore } from '@/features/events/(stores)/use-event-cart-store';
import { NewBadge } from '@/shared/components/common/new-badge';
import { useQueryState, parseAsString } from 'nuqs';
import { toast } from 'sonner';
import { useAddProductToEvent } from '../event-form/(hooks)/use-add-product-to-event';
import type { EventMutationRefreshScope } from '../event-form/(helpers)/event-mutation-refresh';


type ProductCatalogCardProps = {
  id: string;
  sku?: string;
  name: string;
  price: number;
  productType: 'rental' | 'bundle' | 'purchase';
  quantity?: number;
  availableQuantity?: number;
  isAvailable: boolean;
  isNew: boolean;
  slug: string;
  imageUrl?: string;
  disabled?: boolean;
  href?: string;
  refreshScope?: EventMutationRefreshScope;
};

export function ProductCatalogCard({
  id,
  sku,
  name,
  price,
  productType,
  quantity,
  availableQuantity,
  isAvailable,
  isNew,
  slug,
  imageUrl,
  disabled,
  href,
  refreshScope = { type: 'catalog' },
}: ProductCatalogCardProps) {
  const t = useTranslations('eventForm');
  const tCommon = useTranslations('common');
  const currency = useCurrency();
  const { cart, addToCart, isOpen, toggleCart } = useEventCartStore();
  const [qty, setQty] = useState(1);

  const [eventIdParam] = useQueryState('eventId', parseAsString);
  const { mutate: addProductToEvent, isPending: isAddingToEvent } = useAddProductToEvent({ refreshScope });

  const totalQuantity = normalizeQuantity(quantity);
  const effectiveAvailable = normalizeQuantity(availableQuantity);
  const isUnavailable = !isAvailable || effectiveAvailable === 0;
  const showAvailability = productType === 'rental' || productType === 'bundle';
  const numericPrice = Number(price) || 0;

  function handleAdd() {
    if (!eventIdParam) {
      toast.error(t('productCatalog.errorOverviewRequired'));
      return;
    }
    if (!sku) {
      toast.error(t('productCatalog.errorSkuRequired'));
      return;
    }

    const existingCartItem = cart.find(
      (item) => (sku && item.sku === sku) || item.id === id
    );
    const existingQuantity = existingCartItem ? existingCartItem.quantity : 0;
    const apiQuantity = existingQuantity + qty;
    const remainingAvailable = effectiveAvailable - existingQuantity;

    if (showAvailability && apiQuantity > effectiveAvailable) {
      toast.error(
        t('productCatalog.errorExceedsAvailable', {
          existing: existingQuantity,
          remaining: Math.max(remainingAvailable, 0),
        })
      );
      return;
    }

    addProductToEvent(
      {
        eventId: eventIdParam,
        sku,
        quantity: apiQuantity,
        isRentEntirePeriod: true,
      },
      {
        onSuccess: () => {
          addToCart({
            id,
            sku,
            name,
            thumbnail: imageUrl ?? '',
            quantity: qty,
            price: numericPrice,
            isRental: productType === 'rental',
            maxQuantity: totalQuantity,
            availableQuantity: effectiveAvailable,
            totalQuantity,
            rentalAvailableQuantity: effectiveAvailable,
            slug,
          });
          setQty(1);
          if (!isOpen) {
            toggleCart();
          }
        },
      }
    );
  }

  return (
    <div className="relative z-0 flex h-full w-full flex-col overflow-hidden rounded-[18px] bg-card p-0">
      {isNew && <NewBadge size="md" label={tCommon('new')} />}

      <Link
        href={href ?? `/rent/${slug}`}
        className="flex flex-1 flex-col w-full"
        style={{ opacity: isUnavailable ? 0.5 : 1 }}
      >
        <div className="flex h-78 w-full items-center justify-center bg-card">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              width={320}
              height={240}
              className="h-full w-full object-contain p-1"
            />
          ) : (
            <PackageIcon className="size-12 text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <p className="line-clamp-2 h-10 text-sm font-medium leading-5" translate="no">
            {name}
          </p>
          <p className="text-sm font-bold" translate="no">
            {numericPrice.toFixed(2)} {currency.symbol}
          </p>

          {showAvailability && (
            <div className="mt-2 flex flex-col gap-0.5 text-sm">
              <p>
                {tCommon('availability')}:{' '}
                <span className="font-semibold">{effectiveAvailable}</span>
              </p>
              <p>
                {tCommon('quantity')}:{' '}
                <span className="font-semibold">{totalQuantity}</span>
              </p>
            </div>
          )}
        </div>
      </Link>

      {isUnavailable ? (
        <div className="px-4 pb-4">
          <div className="inline-flex w-max items-center gap-1.5 rounded-sm bg-light-gray px-1.5 py-0.5 text-xs text-muted-foreground">
            <span className="size-2 rounded-sm bg-gray-500" />
            {t('productCatalog.unavailable')}
          </div>
        </div>
      ) : (
        <div className="flex flex-col-reverse gap-3 px-4 pb-4 xl:flex-row xl:items-center">
          <Button
            variant="outline-primary"
            type="button"
            className="w-full xl:flex-1 text-sm"
            disabled={qty > effectiveAvailable || qty === 0 || disabled || isAddingToEvent}
            isLoading={isAddingToEvent}
            onClick={handleAdd}
          >
            {t('productCatalog.addToEvent')}
          </Button>
          <QuantitySelector
            value={qty}
            min={1}
            max={effectiveAvailable}
            onIncrease={() => setQty((v) => Math.min(v + 1, effectiveAvailable))}
            onDecrease={() => setQty((v) => Math.max(v - 1, 1))}
            onChange={setQty}
            className="w-full justify-between xl:w-auto xl:justify-start"
          />
        </div>
      )}
    </div>
  );
}

function normalizeQuantity(value?: number) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(value, 0) : 0;
}
