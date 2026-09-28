import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EventProductDetailPdfContent } from '@/features/events/product-detail/(components)/event-product-detail-pdf-content';

describe('EventProductDetailPdfContent', () => {
  it('renders the legacy product details and bundle contents', () => {
    render(<EventProductDetailPdfContent
      product={{
        id: 'p1', sku: 'SKU-1', name: 'Bundle', price: 12.5, productType: 'bundle', images: [],
        image_url: '', availableQuantity: 2, quantity: 2, slug: 'bundle', category: 'Coolers',
        brand: 'CCEP', manufacturer: 'Maker', material: 'Steel', weight: 4, length: 10,
        width: 20, height: 30, startDate: '', endDate: '', startTime: '', endTime: '',
        children: [{ sku: 'CHILD-1', name: 'Child product', requiredQty: 2 }],
      }}
      images={[]}
      currencySymbol="€"
      printedAt="05.08.2026"
      t={(key) => key}
    />);

    expect(screen.getByText('12.50 €')).toBeInTheDocument();
    expect(screen.getByText('Coolers')).toBeInTheDocument();
    expect(screen.getByText('Steel')).toBeInTheDocument();
    expect(screen.getByText('Child product')).toBeInTheDocument();
    expect(screen.getByText('X 2')).toBeInTheDocument();
  });

  it('omits manufacturer and material type when the API has no display value', () => {
    render(<EventProductDetailPdfContent
      product={{
        id: 'p1', sku: 'SKU-1', name: 'Product', price: 12.5, productType: 'rental', images: [],
        image_url: '', availableQuantity: 2, quantity: 2, slug: 'product', category: 'Coolers',
        brand: 'CCEP', manufacturer: '-', material: '  ', weight: 4, length: 10,
        width: 20, height: 30, startDate: '', endDate: '', startTime: '', endTime: '',
      }}
      images={[]}
      currencySymbol="EUR"
      printedAt="05.08.2026"
      t={(key) => key}
    />);

    expect(screen.queryByText('manufacturer:')).not.toBeInTheDocument();
    expect(screen.queryByText('materialType:')).not.toBeInTheDocument();
  });
});
