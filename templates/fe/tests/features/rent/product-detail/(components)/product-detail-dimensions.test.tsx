import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProductDetailDimensions } from '@/features/rent/product-detail/(components)/product-detail-dimensions';
import { TooltipProvider } from '@/shared/components/ui/tooltip';

const t = (key: string) => key;

describe('ProductDetailDimensions', () => {
  it('renders weight in kg and length/width/height in cm', () => {
    render(<ProductDetailDimensions weight={12} length={50} width={40} height={31} t={t} />);

    expect(screen.getByText('12 kg')).toBeInTheDocument();
    expect(screen.getByText('50 cm')).toBeInTheDocument();
    expect(screen.getByText('40 cm')).toBeInTheDocument();
    expect(screen.getByText('31 cm')).toBeInTheDocument();
  });

  it('shows a dash placeholder for any missing dimension instead of hiding the row', () => {
    render(<ProductDetailDimensions t={t} />);

    expect(screen.getByText('- kg')).toBeInTheDocument();
    expect(screen.getAllByText('- cm')).toHaveLength(3);
  });

  it('renders bundle products inside the dimensions card', () => {
    render(
      <TooltipProvider>
        <ProductDetailDimensions
          weight={12}
          bundleItems={[{ sku: 'CUP-1', name: 'Coffee cup', requiredQty: 4 }]}
          t={t}
        />
      </TooltipProvider>,
    );

    const bundleList = screen.getByRole('list', { name: 'bundleProduct' });
    const dimensionsCard = screen.getByText('12 kg').closest('[data-slot="card"]');

    expect(dimensionsCard).toContainElement(bundleList);
    expect(screen.getByRole('button', { name: 'bundleProductInfo' })).toBeVisible();
    expect(screen.getByText('Coffee cup')).toBeVisible();
    expect(screen.getByText('X 4')).toBeVisible();
  });
});
