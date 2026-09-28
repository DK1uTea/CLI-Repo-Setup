'use client'

import { useEffect, useRef } from 'react';
import { useQueryState, parseAsInteger, parseAsString } from 'nuqs';
import ProductListEmpty from '@/features/rent/catalogue/(components)/product-list-empty';
import ProductListSkeleton from '@/features/rent/catalogue/(components)/product-list-skeleton';
import { ProductCatalogCard } from '../../(components)/product-catalog-card';
import { useRentUrlDates } from '../../(hooks)/use-rent-url-dates';
import { useProductList } from '../(hooks)/use-product-list';
import { ProductListPagination } from './product-list-pagination';

const PER_PAGE = 12;

const ProductList = () => {
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [keyword] = useQueryState('keyword', parseAsString.withDefault(''));
  const [category] = useQueryState('category', parseAsString.withDefault(''));
  const { fromIso, toIso, isReady } = useRentUrlDates();

  const filterKey = `${keyword}|${category}|${fromIso ?? ''}|${toIso ?? ''}`;
  const prevFilterKey = useRef(filterKey);
  useEffect(() => {
    if (prevFilterKey.current !== filterKey) {
      prevFilterKey.current = filterKey;
      setPage(1);
    }
  }, [filterKey, setPage]);

  const { data, isFetching } = useProductList({
    page,
    limit: PER_PAGE,
    search: keyword || undefined,
    categorySlug: category || undefined,
    from: isReady ? fromIso : undefined,
    to: isReady ? toIso : undefined,
  });

  const products = data?.products ?? [];
  const pagination = data?.pagination;

  if (isFetching) {
    return <ProductListSkeleton />;
  }

  if (!products.length) {
    return <ProductListEmpty />;
  }

  return (
    <div className='space-y-8'>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCatalogCard
            key={product.id}
            name={product.name}
            price={product.price}
            productType={product.productType}
            quantity={product.totalQuantity}
            availableQuantity={product.availableQuantity}
            isAvailable={product.isAvailable}
            isNew={product.isNew ?? false}
            slug={product.slug}
            imageUrl={product.imageUrl}
            hasLinkToDetail={false}
          />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <ProductListPagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

export default ProductList;
