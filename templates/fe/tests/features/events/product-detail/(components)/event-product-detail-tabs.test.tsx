import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EventProductDetailTabs } from '@/features/events/product-detail/(components)/event-product-detail-tabs';
import type { EventProductDetail } from '@/features/events/product-detail/(hooks)/use-event-product-detail';

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key, useLocale: () => 'en' }));
vi.mock('nuqs', () => ({ parseAsString: { withDefault: () => ({}) }, useQueryState: () => [null, vi.fn()] }));
vi.mock('@/i18n/navigation', () => ({ usePathname: () => '/product-detail' }));
vi.mock('@/features/rent/product-detail/(components)/rental-availability', () => ({
  default: () => <div>availability content</div>,
}));

const baseProduct = {
  id: 'p1', sku: 'SKU-1', name: 'Product', price: 10,
  images: [], image_url: '', availableQuantity: 2, quantity: 2, slug: 'product',
  startDate: '2026-08-01', endDate: '2026-08-02', startTime: '10:00', endTime: '12:00',
} satisfies Partial<EventProductDetail>;

describe('EventProductDetailTabs', () => {
  it('shows the availability tab for a rental product', () => {
    render(
      <EventProductDetailTabs
        product={{ ...baseProduct, productType: 'rental' } as EventProductDetail}
        eventId="event-1"
      />,
    );

    expect(screen.getByRole('tab', { name: 'tabAvailability' })).toBeInTheDocument();
  });

  it('hides the availability tab for a bundle product', () => {
    render(
      <EventProductDetailTabs
        product={{ ...baseProduct, productType: 'bundle' } as EventProductDetail}
        eventId="event-1"
      />,
    );

    expect(screen.queryByRole('tab', { name: 'tabAvailability' })).not.toBeInTheDocument();
  });

  it('shows the documents tab for rental and bundle products', () => {
    const { unmount } = render(
      <EventProductDetailTabs
        product={{ ...baseProduct, productType: 'rental' } as EventProductDetail}
        eventId="event-1"
      />,
    );

    expect(screen.getByRole('tab', { name: 'documents' })).toBeInTheDocument();
    unmount();

    render(
      <EventProductDetailTabs
        product={{ ...baseProduct, productType: 'bundle' } as EventProductDetail}
        eventId="event-1"
      />,
    );

    expect(screen.getByRole('tab', { name: 'documents' })).toBeInTheDocument();
  });
});
