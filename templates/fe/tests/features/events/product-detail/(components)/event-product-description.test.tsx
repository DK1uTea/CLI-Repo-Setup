import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EventProductDescription } from '@/features/events/product-detail/(components)/event-product-description';
import { TooltipProvider } from '@/shared/components/ui/tooltip';

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));

describe('EventProductDescription', () => {
  it('renders the HTML description and the dimensions card together', () => {
    render(<EventProductDescription description="<p>Nice product</p>" weight={12} length={50} width={40} height={31} />);

    expect(screen.getByText('Nice product')).toBeInTheDocument();
    expect(screen.getByText('12 kg')).toBeInTheDocument();
    expect(screen.getByText('50 cm')).toBeInTheDocument();
    expect(screen.getByText('40 cm')).toBeInTheDocument();
    expect(screen.getByText('31 cm')).toBeInTheDocument();
  });

  it('still shows the dimensions card with dash placeholders when there is no description or dimension data', () => {
    render(<EventProductDescription />);

    expect(screen.getByText('- kg')).toBeInTheDocument();
    expect(screen.getAllByText('- cm')).toHaveLength(3);
  });

  it('shows event bundle products inside the shared dimensions card', () => {
    render(
      <TooltipProvider>
        <EventProductDescription
          weight={12}
          bundleItems={[{ sku: 'CUP-1', name: 'Coffee cup', requiredQty: 4 }]}
        />
      </TooltipProvider>,
    );

    const bundleList = screen.getByRole('list', { name: 'bundleProduct' });
    const dimensionsCard = screen.getByText('12 kg').closest('[data-slot="card"]');

    expect(dimensionsCard).toContainElement(bundleList);
  });
});
