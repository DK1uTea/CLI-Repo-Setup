import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { describe, expect, it } from 'vitest';

import messages from '@/messages/en.json';
import RentalOrdersSearchFilter from '@/features/rent/rent-orders/(components)/rental-orders-search-filter';

describe('RentalOrdersSearchFilter', () => {
  it('renders Sort before Status as the fixed trigger labels', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <NuqsTestingAdapter>
          <RentalOrdersSearchFilter />
        </NuqsTestingAdapter>
      </NextIntlClientProvider>,
    );

    expect(screen.getAllByRole('combobox').slice(0, 2).map((trigger) => trigger.getAttribute('aria-label')))
      .toEqual(['Sort', 'Status']);
  });
});
