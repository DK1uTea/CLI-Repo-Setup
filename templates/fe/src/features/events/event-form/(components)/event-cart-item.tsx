'use client';

import { useId } from 'react';
import { useQueryState, parseAsString } from 'nuqs';
import { PackageIcon, Trash2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { useEventDetailStore } from '@/features/events/(stores)/use-event-detail-store';
import { useCurrency } from '@/shared/stores/use-user-store';
import { NewBadge } from '@/shared/components/common/new-badge';
import { QuantitySelector } from '@/shared/components/ui/quantity-selector';
import type { CartItem } from '@/features/events/(stores)/use-event-cart-store';
import { getCartItemOrderState } from '../(helpers)/cart-order-state';
import { useEventOrderActiveCount } from '../(hooks)/use-event-order-active-count';

type Props = {
  item: CartItem;
  href?: string;
  onNavigate?: () => void;
  onDelete: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
  onSubmitQuantity: (quantity: number) => void;
  disabled?: boolean;
  hideDelete?: boolean;
};

export function EventCartItem({ item, href, onNavigate, onDelete, onIncrease, onDecrease, onSubmitQuantity, disabled, hideDelete }: Props) {
  const t = useTranslations('common');
  const tRent = useTranslations('rent');
  const currency = useCurrency();
  const overQuantityErrorId = useId();
  const availableQty = item.rentalAvailableQuantity ?? item.availableQuantity;
  const isOverQuantity =
    typeof availableQty === 'number' && Number.isInteger(availableQty) && availableQty < item.quantity;

  // A DRAFT event was never published/ordered, so comparing cart quantity
  // against an order that doesn't exist yet is meaningless — skip the
  // new/deleted/changed indicators entirely until the event is ACTIVE.
  const isActiveEvent = useEventDetailStore((state) => state.status) === 'ACTIVE';
  const [eventIdParam] = useQueryState('eventId', parseAsString);
  // After an order is cancelled, the backend zeroes `actualQuantity` on every
  // line, which would otherwise make every item look "new" — the badges only
  // make sense while there is a real (uncancelled) active order to diverge from.
  const { data: activeOrderCount } = useEventOrderActiveCount(eventIdParam);
  const hasActiveOrder = Boolean(activeOrderCount?.haveActive);
  const showOrderState = isActiveEvent && hasActiveOrder;
  const activeOrderUnits = showOrderState ? item.actualQuantity ?? 0 : 0;
  const orderState = showOrderState ? getCartItemOrderState(item.quantity, item.actualQuantity) : null;
  const isNewlyAdded = orderState === 'new';
  const isPendingRemovalFromOrder = orderState === 'deleted';
  const isQuantityChanged = orderState === 'changed';

  const thumbnail = item.thumbnail ? (
    <img src={item.thumbnail} alt="" className="size-29 shrink-0 rounded-lg object-cover" />
  ) : (
    <div className="flex size-29 shrink-0 items-center justify-center rounded-lg bg-gray-100">
      <PackageIcon className="size-8 text-muted-foreground" />
    </div>
  );

  return (
    <div
      data-testid="event-cart-item"
      className={cn(
        'relative flex w-full gap-3 overflow-hidden rounded-[18px] border border-border bg-background p-4 shrink-0',
        isNewlyAdded && 'border-success bg-success/5',
        isPendingRemovalFromOrder && 'border-destructive bg-destructive/5',
      )}
    >
      {item.isNew && <NewBadge size="sm" label={t('new')} />}
      {href ? <Link href={href} className="shrink-0" onClick={onNavigate}>{thumbnail}</Link> : thumbnail}

      <div className="flex min-h-29 flex-1 flex-col justify-between gap-2">
        <div className="flex items-start justify-between gap-2">
          {href ? (
            <Link href={href} className="line-clamp-2 text-sm hover:underline hover:text-primary" translate="no" onClick={onNavigate}>{item.name}</Link>
          ) : (
            <span className="line-clamp-2 text-sm" translate="no">{item.name}</span>
          )}
          {!hideDelete && !isPendingRemovalFromOrder && (
            <Button type="button" variant="ghost-primary" size="icon-sm" onClick={onDelete} disabled={disabled} aria-label={t('delete')}>
              <Trash2Icon />
            </Button>
          )}
        </div>

        {(isNewlyAdded || isPendingRemovalFromOrder || activeOrderUnits > 0) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {isNewlyAdded && (
              <Badge className="border-success/20 bg-success/10 text-success">{t('new')}</Badge>
            )}
            {isPendingRemovalFromOrder && (
              <Badge variant="destructive">{t('deleted')}</Badge>
            )}
            {isQuantityChanged && (
              <Badge className="border-warning/20 bg-warning/10 text-warning">{t('changed')}</Badge>
            )}
            {activeOrderUnits > 0 && (
              <span className="text-xs font-medium text-destructive">
                {t('activeOrderUnits', { count: activeOrderUnits })}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-0.5">
            {item.totalQuantity !== undefined && (
              <p>
                {t('quantity')}: <span className="font-bold text-foreground">{item.totalQuantity}</span>
              </p>
            )}
            {item.rentalAvailableQuantity !== undefined && (
              <p>
                {tRent('productDetail.availability')}: <span className="font-bold text-foreground">{item.rentalAvailableQuantity}</span>
              </p>
            )}
            {Number(item.price || 0) > 0 && <p className="font-bold">{Number(item.price || 0).toFixed(2)} {currency.symbol}</p>}
          </div>
          <QuantitySelector
            value={item.quantity}
            min={1}
            max={availableQty ?? item.totalQuantity ?? 9999}
            onIncrease={onIncrease}
            onDecrease={onDecrease}
            onSubmit={onSubmitQuantity}
            size="sm"
            disabled={disabled}
            className="bg-card self-start"
            invalid={isOverQuantity}
            errorId={isOverQuantity ? overQuantityErrorId : undefined}
            aria-label={t('quantity')}
          />
        </div>
        {isOverQuantity && (
          <p id={overQuantityErrorId} role="alert" className="text-[13px] text-destructive">
            {t('overQuantity', { quantity: availableQty })}
          </p>
        )}
      </div>
    </div>
  );
}
