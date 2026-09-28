'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useUnsavedChanges } from '@/shared/hooks/common/use-unsaved-changes';
import { UnsavedChangesDialog } from '@/shared/components/common/unsaved-changes-dialog';
import { useQueryStates, useQueryState, parseAsString, parseAsInteger } from 'nuqs';
import { useProductDetailHref } from '../../../(hooks)/use-product-detail-href';
import { useProductsFilterConfig } from '../../../(hooks)/use-products-filter-config';
import { useProductsList } from '../../../(hooks)/use-products-list';
import { SearchInput } from '@/shared/components/common/search-input';
import { MultiLevelSelect } from '@/shared/components/ui/multi-level-select';
import { SelectFloat } from '@/shared/components/ui/select-float';
import { SelectItem } from '@/shared/components/ui/select';

import { ProductCatalogGrid } from './product-catalog-grid';
import { ProductCatalogPagination } from './product-catalog-pagination';
import { ProductCatalogEmpty } from './product-catalog-empty';
import { ProductCatalogGridSkeleton } from './product-catalog-grid-skeleton';

export function EventFormStepProductCatalog() {
  const methods = useFormContext();
  const { isDirty } = methods.formState;
  const { dialogProps } = useUnsavedChanges({
    isDirty,
    onDiscard: () => methods.reset(),
  });
  const t = useTranslations('eventForm');
  const tCommon = useTranslations('common');
  const getProductDetailHref = useProductDetailHref();

  const [eventIdParam] = useQueryState('eventId', parseAsString);

  const { data: filterConfig, isLoading: isFilterConfigLoading } = useProductsFilterConfig();

  const categoriesOptions = filterConfig?.categories?.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    parent_id: c.parentId ?? null
  })) ?? [];

  const brandOptions = filterConfig?.brands?.map((b) => ({
    value: b.id,
    label: b.name,
  })) ?? [];

  const [{ category, brand }, setFilters] = useQueryStates({
    category: parseAsString.withDefault(''),
    brand: parseAsString.withDefault(''),
  });

  const [keyword] = useQueryState('keyword', parseAsString.withDefault(''));
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  const { data: productsList, isLoading: isProductsLoading } = useProductsList({
    eventId: eventIdParam || undefined,
    categorySlug: category || undefined,
    brandId: brand || undefined,
    search: keyword || undefined,
    page,
    limit: 12,
  });

  const hasNoProducts = !isProductsLoading && (!productsList?.items || productsList.items.length === 0);
  const hasProducts = !isProductsLoading && productsList?.items && productsList.items.length > 0;
  const showPagination = !isProductsLoading && productsList?.pagination && productsList.pagination.totalPages > 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MultiLevelSelect
          label={t('productCatalog.selectCategory')}
          value={category}
          options={categoriesOptions}
          onChangeAction={(val) => {
            setFilters({ category: val });
            setPage(1);
          }}
          triggerClassName="bg-card"
        />

        <SelectFloat
          label={t('productCatalog.selectBrand')}
          value={brand || 'all'}
          onValueChange={(val) => {
            setFilters({ brand: val === 'all' ? '' : val });
            setPage(1);
          }}
          triggerClassName="bg-card"
          disabled={isFilterConfigLoading}
        >
          <SelectItem value="all">{tCommon('showAll')}</SelectItem>
          {brandOptions.map((b) => (
            <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
          ))}
        </SelectFloat>

        <SearchInput
          testId="product-catalog-search-input"
          searchKey="keyword"
          placeholder={t('productCatalog.searchProduct')}
          className="h-13.5 bg-card"
          onSearchAction={() => setPage(1)}
        />
      </div>

      {isProductsLoading && <ProductCatalogGridSkeleton />}

      {hasNoProducts && <ProductCatalogEmpty />}

      {hasProducts && (
        <ProductCatalogGrid
          items={productsList.items}
          getProductDetailHref={getProductDetailHref}
        />
      )}

      {showPagination && (
        <ProductCatalogPagination
          pagination={productsList.pagination}
          page={page}
          onPageChange={setPage}
        />
      )}

      <UnsavedChangesDialog {...dialogProps} />
    </div>
  );
}
