import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it } from 'vitest';

import { ProductDetailInfoShell } from '@/features/rent/product-detail/(components)/product-detail-info-shell';
import { TooltipProvider } from '@/shared/components/ui/tooltip';

function renderShell(props: ComponentProps<typeof ProductDetailInfoShell>) {
  return render(<TooltipProvider><ProductDetailInfoShell {...props} /></TooltipProvider>);
}

const t = (key: string) => key;

const baseProps = {
  name: 'Coffee machine',
  downloadPdfButton: <button type="button">download</button>,
  availableQuantity: 3,
  totalQuantity: 5,
  priceLabel: 'price',
  price: 12.5,
  currencySymbol: '€',
  actionArea: <div>action area content</div>,
  descriptiveDetails: [],
  t,
};

describe('ProductDetailInfoShell', () => {
  it('renders the shared header, quantity line, price, and the action-area slot', () => {
    renderShell(baseProps);

    expect(screen.getByRole('heading', { name: 'Coffee machine' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'download' })).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('12.50 €')).toBeInTheDocument();
    expect(screen.getByText('action area content')).toBeInTheDocument();
  });

  it('hides the product-details section when there are no rows', () => {
    renderShell(baseProps);

    expect(screen.queryByText('productDetails')).not.toBeInTheDocument();
  });

  it('shows the product-details section with the given descriptive rows', () => {
    renderShell({
      ...baseProps,
      descriptiveDetails: [{ label: 'category', value: 'Kitchen' }],
    });

    expect(screen.getByText('productDetails')).toBeInTheDocument();
    expect(screen.getByText('Kitchen')).toBeInTheDocument();
  });

  it('does not render weight/length/width/height — those moved to the Description tab', () => {
    renderShell({
      ...baseProps,
      descriptiveDetails: [{ label: 'category', value: 'Kitchen' }],
    });

    expect(screen.queryByText('weight')).not.toBeInTheDocument();
  });

  it('does not render bundle products because they belong to the dimensions card', () => {
    renderShell(baseProps);

    expect(screen.queryByText('bundleProduct')).not.toBeInTheDocument();
  });
});
