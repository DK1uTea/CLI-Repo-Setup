import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';

import enMessages from '@/messages/en.json';
import deMessages from '@/messages/de.json';
import OrderDetailSummaryCard from '@/features/rent/order-detail/(components)/order-detail-summary-card';
import type { OrderDetail } from '@/features/rent/order-detail/(services)/order-detail-service';

vi.mock('@/shared/stores/use-user-store', () => ({
  useCurrency: () => ({ symbol: '€' }),
}));

const order = (discountCode: OrderDetail['discountCode']): OrderDetail => ({
  orderId: 'order-1',
  status: 'pending',
  from: '2026-01-01',
  to: '2026-01-02',
  subtotal: 100,
  discountAmount: 10,
  discountCode,
  shippingAmount: 5,
  shippingMethod: 'Standard',
  total: 95,
  customer: { name: 'Test User', email: 'test@example.com' },
  shipping: {
    method: 'Standard',
    address: {
      firstname: 'Test',
      lastname: 'User',
      street: 'Test Street 1',
      city: 'Berlin',
      region: null,
      postcode: '10115',
      countryId: 'DE',
      telephone: '+49123456789',
    },
  },
  items: [],
});

function renderCard(
  discountCode: OrderDetail['discountCode'],
  locale: 'en' | 'de' = 'en',
) {
  const messages = locale === 'en' ? enMessages : deMessages;

  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <OrderDetailSummaryCard order={order(discountCode)} />
    </NextIntlClientProvider>,
  );
}

describe('OrderDetailSummaryCard', () => {
  it('renders the discount code when one is provided', () => {
    renderCard('SAVE10');

    expect(screen.getByText('SAVE10')).toBeInTheDocument();
  });

  it('renders the English fallback for a missing discount code', () => {
    renderCard('   ');

    expect(screen.getByText('No discount')).toBeInTheDocument();
  });

  it('renders the German fallback for a null discount code', () => {
    renderCard(null, 'de');

    expect(screen.getByText('Kein Rabatt')).toBeInTheDocument();
  });
});
