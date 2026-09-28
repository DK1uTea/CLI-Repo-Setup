'use client';

import { EventCartItem } from '@/features/events/event-form/(components)/event-cart-item';
import type { CartItem } from '@/features/events/(stores)/use-event-cart-store';

type Props = {
  items: CartItem[];
  readOnly?: boolean;
  hideDelete?: boolean;
  onDelete?: (index: number) => void;
  onIncrease?: (index: number) => void;
  onDecrease?: (index: number) => void;
  onSubmitQuantity?: (index: number, quantity: number) => void;
};

export function EventCartList({
  items,
  readOnly,
  hideDelete,
  onDelete,
  onIncrease,
  onDecrease,
  onSubmitQuantity,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <EventCartItem
          key={`${item.id}-${i}`}
          item={item}
          hideDelete={hideDelete}
          disabled={readOnly}
          onDelete={() => onDelete?.(i)}
          onIncrease={() => onIncrease?.(i)}
          onDecrease={() => onDecrease?.(i)}
          onSubmitQuantity={(quantity) => onSubmitQuantity?.(i, quantity)}
        />
      ))}
    </div>
  );
}
