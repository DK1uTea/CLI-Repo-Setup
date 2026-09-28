import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ProductGeneralInfo from '@/features/rent/product-detail/(components)/product-general-info';
import type { ProductDetail } from '@/features/rent/product-detail/(services)/product-detail-service';
import { TooltipProvider } from '@/shared/components/ui/tooltip';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key === 'emptyValue' ? '-' : key,
}));
vi.mock('@/shared/stores/use-user-store', () => ({
  useCurrency: () => ({ symbol: '€' }),
  useDateFormat: () => 'DD.MM.YYYY',
}));
vi.mock('@/features/rent/(hooks)/use-rent-url-dates', () => ({
  useRentUrlDates: () => ({ from: undefined, to: undefined, setDateRange: vi.fn() }),
}));
vi.mock('@/features/rent/product-detail/(components)/product-detail-download-pdf', () => ({
  ProductDetailDownloadPdf: () => <button type="button">download</button>,
}));

const baseProduct = {
  id: 'p1', sku: 'SKU-1', name: 'Coffee machine', slug: 'coffee-machine', price: 12.5,
  totalQuantity: 5, availableQuantity: 3, isAvailable: true,
} satisfies Partial<ProductDetail>;

function renderInfo(product: ProductDetail) {
  return render(<TooltipProvider><ProductGeneralInfo product={product} /></TooltipProvider>);
}

describe('ProductGeneralInfo', () => {
  it('shows a dash for an empty short description', () => {
    renderInfo({ ...baseProduct, productType: 'rental' } as ProductDetail);

    expect(screen.getByText('shortDescription')).toBeInTheDocument();
    expect(screen.getByText('-', { exact: true })).toBeInTheDocument();
  });

  it('shows the product-details section derived from category/brand/manufacturer/material/shipping', () => {
    renderInfo({
      ...baseProduct,
      productType: 'rental',
      categoryLabels: ['Kitchen'],
      brand: 'AcmeCo',
      manufacturer: 'Acme',
      material: ['Steel'],
      shippingMethod: 'Courier',
    } as ProductDetail);

    expect(screen.getByText('productDetails')).toBeInTheDocument();
    expect(screen.getByText('Kitchen')).toBeInTheDocument();
    expect(screen.getByText('Courier')).toBeInTheDocument();
  });

  it('hides the product-details section when no descriptive/dimension fields have a value', () => {
    renderInfo({ ...baseProduct, productType: 'rental' } as ProductDetail);

    expect(screen.queryByText('productDetails')).not.toBeInTheDocument();
  });

  it('does not show bundle children in general information for a bundle product', () => {
    renderInfo({
      ...baseProduct,
      productType: 'bundle',
      children: [{ sku: 'CHILD-1', name: 'Milk frother', requiredQty: 2 }],
    } as ProductDetail);

    expect(screen.queryByText('bundleProduct')).not.toBeInTheDocument();
    expect(screen.queryByText('Milk frother')).not.toBeInTheDocument();
  });
});
