'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useUnsavedChanges } from '@/shared/hooks/common/use-unsaved-changes';
import { UnsavedChangesDialog } from '@/shared/components/common/unsaved-changes-dialog';
import { ShoppingCartIcon, SearchIcon } from 'lucide-react';
import { useQueryStates, useQueryState, parseAsString, parseAsInteger } from 'nuqs';
import { useProductDetailHref } from '../../../(hooks)/use-product-detail-href';
import { useProductsHelpingHandsList } from '../../../(hooks)/use-products-helping-hands-list';
import { useHelperTypeOptions } from '../../../(hooks)/use-helper-type-options';
import { Input } from '@/shared/components/ui/input';
import { SelectFloat } from '@/shared/components/ui/select-float';
import { SelectItem } from '@/shared/components/ui/select';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/shared/components/ui/empty';
import { ProductCatalogCard } from '@/features/events/(components)/product-catalog-card';
import { HelpingHandsUploadCard } from './helping-hands-upload-card';
import { ProductCatalogGridSkeleton } from '../event-form-step-product-catalog/product-catalog-grid-skeleton';
import { HelpingHandsPagination } from './helping-hands-pagination';
import { useSubmitStepHelpingHands } from '../../../(hooks)/use-submit-step-helping-hands';

export function EventFormStepHelpingHands() {
  const methods = useFormContext();
  const { isDirty } = methods.formState;
  const { submit } = useSubmitStepHelpingHands();
  const { dialogProps } = useUnsavedChanges({
    isDirty,
    onDiscard: () => methods.reset(),
    onSave: async () => {
      if (!await submit()) return false;
      methods.reset(methods.getValues());
    },
  });
  const t = useTranslations('eventForm');
  const tCommon = useTranslations('common');
  const getProductDetailHref = useProductDetailHref();

  const [eventIdParam] = useQueryState('eventId', parseAsString);

  const [{ helperType }, setFilters] = useQueryStates({
    helperType: parseAsString.withDefault(''),
  });

  const [keyword, setKeyword] = useQueryState('keyword', parseAsString.withDefault(''));
  const [searchInput, setSearchInput] = useState(keyword);
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  const { data: productsHelpingHandsList, isLoading } = useProductsHelpingHandsList({
    eventId: eventIdParam || undefined,
    productType: helperType || undefined,
    search: keyword || undefined,
    page,
    limit: 9,
  });

  const productHelpingHands = productsHelpingHandsList?.items || [];
  const helperTypeOptions = useHelperTypeOptions();
  const showPagination = !isLoading && productsHelpingHandsList?.pagination && productsHelpingHandsList.pagination.totalPages > 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SelectFloat
          label={t('helpingHands.selectHelperType')}
          value={helperType || 'all'}
          onValueChange={(val) => {
            setFilters({ helperType: val === 'all' ? '' : val });
            setPage(1);
          }}
          triggerClassName="bg-card"
        >
          <SelectItem value="all">{tCommon('showAll')}</SelectItem>
          {helperTypeOptions.map((type) => (
            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
          ))}
        </SelectFloat>

        <div className="relative md:col-span-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-13.5 bg-card pl-9"
            placeholder={t('helpingHands.searchHelper')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setKeyword(searchInput);
                setPage(1);
              }
            }}
          />
        </div>
      </div>

      {isLoading && <ProductCatalogGridSkeleton />}

      {!isLoading && productHelpingHands.length === 0 && (
        <Empty className='min-h-100'>
          <EmptyMedia>
            <ShoppingCartIcon className="size-24 text-primary opacity-40" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>{t('productCatalog.noProducts')}</EmptyTitle>
            <EmptyDescription className='text-nowrap'>{t('productCatalog.noProductsDescription')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {!isLoading && productHelpingHands.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {productHelpingHands.map((product) => (
            <ProductCatalogCard
              key={product.id}
              id={product.id}
              sku={product.sku}
              name={product.name}
              price={product.price}
              productType={product.productType}
              quantity={product.totalQuantity}
              availableQuantity={product.availableQuantity}
              isAvailable={product.isAvailable}
              isNew={product.isNew ?? false}
              slug={product.slug}
              imageUrl={product.imageUrl}
              href={getProductDetailHref(product.slug, 'helping_hand')}
              refreshScope={{ type: 'helping-hand' }}
            />
          ))}
        </div>
      )}

      {showPagination && (
        <HelpingHandsPagination
          pagination={productsHelpingHandsList.pagination}
          page={page}
          onPageChange={setPage}
        />
      )}

      <HelpingHandsUploadCard />
      <UnsavedChangesDialog {...dialogProps} />
    </div>
  );
}
