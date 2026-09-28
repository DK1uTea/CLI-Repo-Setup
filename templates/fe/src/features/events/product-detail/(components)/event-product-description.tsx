'use client';

import { useTranslations } from 'next-intl';
import { ExpandableHtml } from '@/shared/components/common/expandable-html';
import { ProductDetailDimensions } from '@/features/rent/product-detail/(components)/product-detail-dimensions';

type Props = {
  description?: string;
  shortDescription?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  bundleItems?: {
    sku: string;
    name: string;
    requiredQty: number;
  }[];
};

export function EventProductDescription({
  description,
  shortDescription,
  weight,
  length,
  width,
  height,
  bundleItems,
}: Props) {
  const t = useTranslations('common');
  const tDetail = useTranslations('events.productDetail');
  const content = description || shortDescription;

  return (
    <div className="flex flex-col gap-4">
      {content && (
        <ExpandableHtml
          html={content}
          className="prose prose-sm max-w-none text-muted-foreground"
          seeMoreLabel={t('seeMore')}
          seeLessLabel={t('seeLess')}
        />
      )}
      <ProductDetailDimensions
        weight={weight}
        length={length}
        width={width}
        height={height}
        bundleItems={bundleItems}
        t={tDetail as (key: string) => string}
      />
    </div>
  );
}
