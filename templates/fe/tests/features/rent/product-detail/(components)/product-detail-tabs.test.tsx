import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { describe, expect, it, vi } from 'vitest';

import ProductDetailTabs from '@/features/rent/product-detail/(components)/product-detail-tabs';
import type { ProductDetail } from '@/features/rent/product-detail/(services)/product-detail-service';

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/rent/coffee-machine',
}));
vi.mock('@/features/rent/product-detail/(components)/product-description', () => ({
  default: () => <div>Product description</div>,
}));
vi.mock('@/features/rent/product-detail/(components)/rental-availability', () => ({
  default: () => <div>Rental availability</div>,
}));

const product = {
  id: 'product-1',
  slug: 'coffee-machine',
  sku: 'SKU-1',
  name: 'Coffee machine',
  price: 10,
  totalQuantity: 100,
  availableQuantity: 100,
  productType: 'rental',
  isAvailable: true,
} satisfies ProductDetail;

function renderTabs(productType?: string, searchParams = '', isLoading = false) {
  return render(
    <NextIntlClientProvider
      locale="en"
      messages={{ rent: { productDetail: { description: 'Description', availability: 'Availability', documents: 'Documents' } } }}
    >
      <NuqsTestingAdapter searchParams={searchParams}>
        <ProductDetailTabs
          product={productType ? { ...product, productType } : undefined}
          isLoading={isLoading}
        />
      </NuqsTestingAdapter>
    </NextIntlClientProvider>,
  );
}

describe('ProductDetailTabs', () => {
  it('shows placeholders instead of tabs while the product is loading', () => {
    const { container } = renderTabs(undefined, '', true);

    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument();
  });

  it('hides the availability tab for bundle products', () => {
    renderTabs('bundle');

    expect(screen.getByRole('tab', { name: 'Description' })).toBeVisible();
    expect(screen.queryByRole('tab', { name: 'Availability' })).not.toBeInTheDocument();
  });

  it('shows the availability tab for rental products', () => {
    renderTabs('rental');

    expect(screen.getByRole('tab', { name: 'Availability' })).toBeVisible();
  });

  it('shows the documents tab for rental and bundle products', () => {
    const { unmount } = renderTabs('rental');

    expect(screen.getByRole('tab', { name: 'Documents' })).toBeVisible();
    unmount();

    renderTabs('bundle');

    expect(screen.getByRole('tab', { name: 'Documents' })).toBeVisible();
  });

  it('shows the description when a bundle product is opened with an availability tab URL', () => {
    renderTabs('bundle', '?tab=availability');

    expect(screen.getByText('Product description')).toBeVisible();
  });
});
