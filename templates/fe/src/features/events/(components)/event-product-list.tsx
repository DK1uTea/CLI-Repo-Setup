'use client';

import { PackageIcon } from 'lucide-react';
import { useCurrency } from '@/shared/stores/use-user-store';

type QuoteItem = {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  thumbnail?: string;
};

function EventProductItem({ item, sym }: { item: QuoteItem; sym: string }) {
  return (
    <div className="flex w-full gap-3 overflow-hidden rounded-[18px] border border-border bg-background p-4 shrink-0">
      {item.thumbnail ? (
        <img src={item.thumbnail} alt="" className="size-29 shrink-0 rounded-lg object-cover" />
      ) : (
        <div className="flex size-29 shrink-0 items-center justify-center rounded-lg bg-muted">
          <PackageIcon className="size-8 text-muted-foreground" />
        </div>
      )}

      <div className="flex min-h-29 flex-1 flex-col justify-between gap-2">
        <span className="text-sm" translate="no">{item.name}</span>

        <div className="flex items-end justify-between text-sm">
          <div className="space-y-0.5">
            <p className="text-muted-foreground">
              SKU: <span className="font-bold text-foreground" translate="no">{item.sku}</span>
            </p>
            {Number(item.price || 0) > 0 && (
              <p className="font-bold" translate="no">{Number(item.price || 0).toFixed(2)} {sym}</p>
            )}
          </div>
          <span className="text-sm font-medium text-muted-foreground">×{item.quantity}</span>
        </div>
      </div>
    </div>
  );
}

type Props = { items: QuoteItem[] };

export function EventProductList({ items }: Props) {
  const currency = useCurrency();
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <EventProductItem key={item.id} item={item} sym={currency.symbol} />
      ))}
    </div>
  );
}
