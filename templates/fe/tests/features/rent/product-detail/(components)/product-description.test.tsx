import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';

import ProductDescription from '@/features/rent/product-detail/(components)/product-description';
import type { ProductDetail } from '@/features/rent/product-detail/(services)/product-detail-service';
import enMessages from '@/messages/en.json';
import { TooltipProvider } from '@/shared/components/ui/tooltip';

const product = {
  id: 'bundle-1',
  slug: 'coffee-bundle',
  sku: 'BUNDLE-1',
  name: 'Coffee bundle',
  price: 10,
  totalQuantity: 5,
  availableQuantity: 5,
  productType: 'bundle',
  isAvailable: true,
  children: [
    { sku: 'CUP-1', name: 'Coffee cup', requiredQty: 4 },
    { sku: 'MACHINE-1', name: 'Coffee machine', requiredQty: 1 },
  ],
} satisfies ProductDetail;

function renderDescription(renderedProduct: ProductDetail) {
  return render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <TooltipProvider>
        <ProductDescription product={renderedProduct} />
      </TooltipProvider>
    </NextIntlClientProvider>,
  );
}

describe('ProductDescription', () => {
  it('shows each child product and required quantity for a bundle', () => {
    renderDescription(product);

    const childProducts = screen.getByRole('list', { name: 'Bundle Product' });
    const dimensionsCard = screen.getByText('- kg').closest('[data-slot="card"]');
    expect(dimensionsCard).toContainElement(childProducts);
    expect(within(childProducts).getByText('Coffee cup')).toBeVisible();
    expect(within(childProducts).getByText('X 4')).toBeVisible();
    expect(within(childProducts).getByText('Coffee machine')).toBeVisible();
    expect(within(childProducts).getByText('X 1')).toBeVisible();
  });

  it('does not show child products for a non-bundle product', () => {
    renderDescription({ ...product, productType: 'rental' });

    expect(screen.queryByRole('list', { name: 'Bundle Product' })).not.toBeInTheDocument();
  });

  it('explains bundle products from the information tooltip', async () => {
    const user = userEvent.setup();
    renderDescription(product);

    await user.hover(screen.getByRole('button', {
      name: 'Bundled products require complementary product(s)',
    }));

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Bundled products require complementary product(s)',
    );
  });
});
