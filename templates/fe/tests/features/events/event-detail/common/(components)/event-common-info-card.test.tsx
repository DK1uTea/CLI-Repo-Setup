import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';

import { EventCommonInfoCard } from '@/features/events/event-detail/common/(components)/event-common-info-card';
import messages from '@/messages/en.json';

const BASE_EVENT = {
  id: 'event-1',
  name: 'Launch',
  createdAt: '2026-08-01T08:00:00Z',
  startTime: '2026-08-02T10:00:00Z',
  endTime: '2026-08-02T18:00:00Z',
};

describe('EventCommonInfoCard', () => {
  it("renders an HTML shortDescription as real formatting, not literal tag text", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <EventCommonInfoCard
          namespace="eventDetail"
          event={{ ...BASE_EVENT, shortDescription: '<p>Rich <strong>text</strong> description</p>' }}
        />
      </NextIntlClientProvider>,
    );

    expect(screen.getByText('text', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.queryByText(/<p>|<strong>/)).not.toBeInTheDocument();
  });

  it('renders nothing for the description block when shortDescription is absent', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <EventCommonInfoCard namespace="eventDetail" event={{ ...BASE_EVENT }} />
      </NextIntlClientProvider>,
    );

    expect(screen.getByText('Launch')).toBeInTheDocument();
  });
});
