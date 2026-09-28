import { ProductCatalogCard } from '@/features/events/(components)/product-catalog-card';
import type { ProductDetailStep } from '../../../(hooks)/use-product-detail-href';
import type { Product } from '../../../(hooks)/use-products-list';

type Props = {
  items: Product[];
  getProductDetailHref: (slug: string, step: ProductDetailStep) => string;
};

export function ProductCatalogGrid({ items, getProductDetailHref }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {items.map((product) => (
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
          href={getProductDetailHref(product.slug, 'product_catalog')}
          refreshScope={{ type: 'catalog' }}
        />
      ))}
    </div>
  );
}
