import { useTranslations } from 'next-intl';
import { ShoppingCartIcon } from 'lucide-react';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/shared/components/ui/empty';

export function ProductCatalogEmpty() {
  const t = useTranslations('eventForm');

  return (
    <Empty>
      <EmptyMedia>
        <ShoppingCartIcon className="size-24 text-primary opacity-40" />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>{t('productCatalog.noProducts')}</EmptyTitle>
        <EmptyDescription>{t('productCatalog.noProductsDescription')}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
