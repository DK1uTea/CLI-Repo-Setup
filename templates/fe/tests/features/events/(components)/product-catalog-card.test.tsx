import type { ComponentProps, ComponentType } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProductCatalogCard } from '@/features/events/(components)/product-catalog-card';

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: ComponentProps<'a'>) => (
    <a href={href} {...props}>{children}</a>
  ),
}));
vi.mock('nuqs', () => ({
  parseAsString: {},
  useQueryState: () => [null],
}));
vi.mock('@/features/events/event-form/(hooks)/use-add-product-to-event', () => ({
  useAddProductToEvent: () => ({ mutate: vi.fn(), isPending: false }),
}));

const Card = ProductCatalogCard as ComponentType<Record<string, unknown>>;

const baseProps = {
  id: '4418',
  sku: 'Biertischgarnitur Coke Zero schwarz Set',
  name: 'Biertischgarnitur Coke Zero schwarz Set',
  price: 0,
  productType: 'bundle',
  isNew: false,
  slug: 'biertischgarnitur-coke-zero-schwarz-set',
};

describe('ProductCatalogCard', () => {
  it('renders missing total and available quantities as zero', () => {
    render(<Card {...baseProps} isAvailable={false} />);

    expect(screen.getByText((_, element) => (
      element?.tagName === 'P' && element.textContent === 'availability: 0'
    ))).toBeInTheDocument();
    expect(screen.getByText((_, element) => (
      element?.tagName === 'P' && element.textContent === 'quantity: 0'
    ))).toBeInTheDocument();
  });

  it('shows the New badge when the product is marked isNew', () => {
    render(<Card {...baseProps} isNew isAvailable />);

    expect(screen.getByText('new')).toBeInTheDocument();
  });

  it('uses the API availability flag even when available quantity is positive', () => {
    render(
      <Card
        {...baseProps}
        quantity={90}
        availableQuantity={2}
        isAvailable={false}
      />,
    );

    expect(screen.getByText('productCatalog.unavailable')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'productCatalog.addToEvent' })).not.toBeInTheDocument();
  });
});
