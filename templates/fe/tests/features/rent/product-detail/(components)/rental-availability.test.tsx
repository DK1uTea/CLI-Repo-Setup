import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import RentalAvailability from '@/features/rent/product-detail/(components)/rental-availability';
import type { ProductDetail } from '@/features/rent/product-detail/(services)/product-detail-service';
import { apiProxy } from '@/lib/api';
import { dayjs, nowUtc } from '@/lib/date-utils';

vi.mock('@/lib/api', () => ({ apiProxy: { get: vi.fn() } }));
vi.mock('@/features/rent/product-detail/(components)/rental-availability-month-picker', () => ({
  default: () => <div>Month picker</div>,
}));
vi.mock('@/features/rent/product-detail/(components)/rental-availability-calendar', () => ({
  default: ({ items }: { items: Array<{ day_of_month: number; availability: number }> }) => (
    <div>{items.map((item) => `${item.day_of_month}:${item.availability}`).join(',')}</div>
  ),
}));

const product = {
  id: 'product-1', slug: 'coffee-machine', sku: 'SKU-1', name: 'Coffee machine',
  price: 10, totalQuantity: 100, availableQuantity: 100, productType: 'rental', isAvailable: true,
} satisfies ProductDetail;

type AvailabilitySource =
  | { source: 'rent' }
  | { source: 'event'; eventId: string };

function renderAvailability(source: AvailabilitySource) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <NextIntlClientProvider locale="en" messages={{ common: { availability: 'Availability' } }}>
      <QueryClientProvider client={queryClient}>
        <RentalAvailability product={product} {...source} />
      </QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

describe('RentalAvailability', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads the selected month availability from the event product calendar API', async () => {
    vi.mocked(apiProxy.get).mockResolvedValueOnce({
      data: { data: { items: [{ dayOfMonth: 1, month: 8, year: 2026, rentQty: 12, availability: 88 }] } },
    });

    renderAvailability({ source: 'event', eventId: 'event-1' });

    const currentDate = dayjs.utc(nowUtc());
    await waitFor(() => expect(apiProxy.get).toHaveBeenCalledWith(
      'etr/event-products/coffee-machine/calendar-table',
      { params: { slug: 'coffee-machine', eventId: 'event-1', month: currentDate.month() + 1, year: currentDate.year() } },
    ));
    expect(await screen.findByText('1:88')).toBeVisible();
  });

  it('loads Rent availability from the product calendar API without eventId', async () => {
    vi.mocked(apiProxy.get).mockResolvedValueOnce({ data: { data: { items: [] } } });
    renderAvailability({ source: 'rent' });

    const currentDate = dayjs.utc(nowUtc());
    await waitFor(() => expect(apiProxy.get).toHaveBeenCalledWith(
      'etr/products/coffee-machine/calendar-table',
      { params: { slug: 'coffee-machine', month: currentDate.month() + 1, year: currentDate.year() } },
    ));
  });
});
