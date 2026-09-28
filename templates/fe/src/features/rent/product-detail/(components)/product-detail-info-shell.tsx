'use client';

import type { ReactNode } from 'react';
import { Separator } from '@/shared/components/ui/separator';

export type ProductDetailInfoRow = { label: string; value: string };

type Props = {
  name: string;
  downloadPdfButton: ReactNode;
  availableQuantity: number;
  totalQuantity: number;
  priceLabel: string;
  price: number;
  currencySymbol: string;
  actionArea: ReactNode;
  descriptiveDetails: ProductDetailInfoRow[];
  t: (key: string) => string;
};

// Shared between events/product-detail and rent/product-detail so the two
// surfaces stay visually identical — only the `actionArea` (quantity/reserve/
// add-to-event vs. a date-range picker) is genuinely different per caller.
export function ProductDetailInfoShell({
  name,
  downloadPdfButton,
  availableQuantity,
  totalQuantity,
  priceLabel,
  price,
  currencySymbol,
  actionArea,
  descriptiveDetails,
  t,
}: Props) {
  const hasDetails = descriptiveDetails.length > 0;

  return (
    <div className="flex w-full flex-col gap-6 lg:w-1/2">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between md:gap-3">
        <h1 className="text-[22px] font-bold leading-snug" translate="no">{name}</h1>
        {downloadPdfButton}
      </div>

      <Separator />

      <div className="text-[15px] text-muted-foreground">
        <p>{t('availability')}: <span className="font-bold text-foreground">{availableQuantity}</span></p>
        <p>{t('quantity')}: <span className="font-bold text-foreground">{totalQuantity}</span></p>
      </div>

      <div>
        <p className="text-xs text-muted-foreground">{priceLabel}</p>
        <p className="mt-1 text-2xl font-bold" translate="no">{Number(price || 0).toFixed(2)} {currencySymbol}</p>
      </div>

      {actionArea}

      {hasDetails && (
        <div className="flex flex-col gap-3">
          <p className="text-base font-semibold">{t('productDetails')}</p>
          <div className="grid grid-cols-[160px_1fr] gap-y-2 text-sm">
            {descriptiveDetails.map(({ label, value }) => (
              <div key={label} className="contents">
                <span className="text-muted-foreground">{label}:</span>
                <span className="font-semibold" translate="no">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
