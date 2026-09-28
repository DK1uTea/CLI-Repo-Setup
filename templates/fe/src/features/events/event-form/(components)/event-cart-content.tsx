import { ShoppingBagIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { CartItem } from '@/features/events/(stores)/use-event-cart-store';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/components/ui/empty';
import { EventCartItem } from './event-cart-item';
import { EventCartItemSkeleton } from './event-cart-item-skeleton';

type Props = {
  cart: CartItem[];
  isLoading: boolean;
  disabled: boolean;
  getItemHref: (item: CartItem) => string;
  onDelete: (index: number) => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onNavigate: () => void;
};

export function EventCartContent({
  cart, isLoading, disabled, getItemHref, onDelete, onUpdateQuantity, onNavigate,
}: Props) {
  const t = useTranslations('common');

  return (
    <div className="_custom-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-6">
      {isLoading && (
        <div role="status" aria-label={t('cartLoading')} className="contents">
          {Array.from({ length: 3 }, (_, index) => <EventCartItemSkeleton key={index} />)}
        </div>
      )}
      {!isLoading && cart.map((item, index) => (
        <EventCartItem
          key={`${item.id}-${index}`}
          item={item}
          href={getItemHref(item)}
          onDelete={() => onDelete(index)}
          onIncrease={() => onUpdateQuantity(index, item.quantity + 1)}
          onDecrease={() => onUpdateQuantity(index, item.quantity - 1)}
          onSubmitQuantity={(quantity) => onUpdateQuantity(index, quantity)}
          onNavigate={onNavigate}
          disabled={disabled}
        />
      ))}
      {!isLoading && cart.length === 0 && (
        <Empty className="flex-1">
          <EmptyMedia><ShoppingBagIcon className="size-24 text-primary opacity-40" /></EmptyMedia>
          <EmptyHeader><EmptyTitle>{t('cartEmpty')}</EmptyTitle></EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
