import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';

import { EventCommonPartnership } from '@/features/events/event-detail/common/(components)/event-common-partnership';
import messages from '@/messages/en.json';

describe('EventCommonPartnership', () => {
  it('renders product partner category labels from partnership data', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <EventCommonPartnership
          namespace="eventDetail"
          event={{
            id: 'event-1',
            name: 'Launch',
            createdAt: '2026-08-01T08:00:00Z',
            startTime: '2026-08-02T10:00:00Z',
            endTime: '2026-08-02T18:00:00Z',
            partnershipTypes: ['PRODUCT_PARTNER'],
            productPartnerCategories: ['SOFTDRINKS', 'WATER'],
          }}
        />
      </NextIntlClientProvider>,
    );

    expect(screen.getByText('Product Partner Items')).toBeInTheDocument();
    expect(screen.getByText('Softdrinks')).toBeInTheDocument();
    expect(screen.getByText('Water')).toBeInTheDocument();
    expect(screen.queryByText('SOFTDRINKS')).not.toBeInTheDocument();
  });
});
