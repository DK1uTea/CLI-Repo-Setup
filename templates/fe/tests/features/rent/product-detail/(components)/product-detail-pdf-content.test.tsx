import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProductDetailPdfContent } from '@/features/rent/product-detail/(components)/product-detail-pdf-content';
import type { ProductDetail } from '@/features/rent/product-detail/(services)/product-detail-service';

const product = {
  id: 'p1', slug: 'coffee-machine', sku: 'SKU-1', name: 'Coffee machine', price: 23.5,
  totalQuantity: 5, availableQuantity: 3, productType: 'rental', isAvailable: true,
  categoryLabels: ['Event Equipment'], brand: 'Acme', weight: 12, length: 50, width: 40, height: 31,
} satisfies ProductDetail;

const t = (key: string) => ({
  sku: 'SKU', price: 'Price', category: 'Category', branding: 'Branding', manufacturer: 'Manufacturer',
  materialType: 'Material Type', weight: 'Weight', length: 'Length', width: 'Width', height: 'Height',
  productDetails: 'Product Details', 'pdf.printed': 'Printed',
}[key] ?? key);

describe('ProductDetailPdfContent', () => {
  it('renders product identity, printed timestamp, details, and dimensions', () => {
    render(
      <ProductDetailPdfContent
        product={product}
        images={['https://cdn.example.test/product.png']}
        currencySymbol="€"
        printedAt="07/09/2026 12:00"
        dateFormat="DD/MM/YYYY"
        t={t}
      />,
    );

    expect(screen.getByAltText('Coca-Cola Europacific Partners')).toBeInTheDocument();
    expect(screen.getByText('Printed: 07/09/2026 12:00')).toBeInTheDocument();
    expect(screen.getByText('SKU-1')).toBeInTheDocument();
    expect(screen.getByText('23.50 €')).toBeInTheDocument();
    expect(screen.getByText('Event Equipment')).toBeInTheDocument();
    expect(screen.getByText('Acme')).toBeInTheDocument();
    expect(screen.getByText('12 kg')).toBeInTheDocument();
    expect(screen.getByText('50 cm')).toBeInTheDocument();
    expect(screen.getByText('40 cm')).toBeInTheDocument();
    expect(screen.getByText('31 cm')).toBeInTheDocument();
  });
});
