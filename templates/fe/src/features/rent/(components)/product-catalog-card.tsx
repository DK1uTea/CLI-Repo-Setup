'use client';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PackageIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useCurrency } from '@/shared/stores/use-user-store';
import { NewBadge } from '@/shared/components/common/new-badge';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

type ProductCatalogCardProps = {
  name: string;
  price: number;
  productType: string;
  quantity: number;
  availableQuantity: number;
  isAvailable?: boolean;
  isNew: boolean;
  slug?: string;
  imageUrl?: string;
  brand?: string | null;
  category?: string;
  shortDescription?: string | null;
  hasLinkToDetail?: boolean;
};

export function ProductCatalogCard({
  name,
  price,
  productType,
  quantity,
  availableQuantity,
  isAvailable,
  isNew,
  slug,
  imageUrl,
  brand,
  category,
  shortDescription,
  hasLinkToDetail = false,
}: ProductCatalogCardProps) {
  const t = useTranslations('rent');
  const tCommon = useTranslations('common');
  const currency = useCurrency();
  const searchParams = useSearchParams();

  const isUnavailable = isAvailable === undefined ? availableQuantity === 0 : !isAvailable;
  const showAvailability = productType === 'rental' || productType === 'bundle';
  const currentSearchParams = searchParams.toString();
  const detailHref = slug
    ? `/rent/${slug}${currentSearchParams ? `?${currentSearchParams}` : ''}`
    : '#';

  const cardContent = (
    <>
      {isNew && <NewBadge size="md" label={tCommon('new')} />}

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
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {category && <span className="rounded-full bg-muted px-2 py-0.5">{category}</span>}
          {brand && <span className="rounded-full bg-muted px-2 py-0.5">{brand}</span>}
        </div>

        <p className="line-clamp-2 h-10 text-sm font-medium leading-5" translate="no">
          {name}
        </p>

        {shortDescription && (
          <p className="line-clamp-2 text-xs text-muted-foreground" translate="no">
            {shortDescription}
          </p>
        )}

        <p className="text-sm font-bold" translate="no">
          {(Number(price) || 0).toFixed(2)} {currency.symbol}
        </p>

        {showAvailability && (
          <div className="flex flex-col gap-0.5 text-sm text-muted-foreground mt-2">
            <p>{tCommon('availability')}: <span className="font-semibold">{availableQuantity}</span></p>
            <p>{tCommon('quantity')}: <span className="font-semibold">{quantity}</span></p>
          </div>
        )}

        {(hasLinkToDetail && !isUnavailable) && (
          <Button
            variant="outline-primary"
            href={detailHref}
            className='mt-auto'
          >
            {t('productCatalog.catalogueProduct')}
          </Button>
        )}

        {(hasLinkToDetail && isUnavailable) && (
          <div className='mt-auto'>
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              <span className="size-2 rounded-sm bg-destructive" />
              {t('productCatalog.unavailable')}
            </span>
          </div>
        )}
      </div>
    </>
  );

  const cardClassName = cn(
    'relative flex h-full w-full flex-col overflow-hidden rounded-[18px] border border-border bg-card p-0',
    isUnavailable && 'opacity-50',
  );

  if (hasLinkToDetail) {
    return <div className={cardClassName}>{cardContent}</div>;
  }

  return (
    <Link href={detailHref} className={cardClassName}>
      {cardContent}
    </Link>
  );
}
