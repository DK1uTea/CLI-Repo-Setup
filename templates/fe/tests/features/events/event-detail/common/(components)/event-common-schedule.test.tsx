import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';

import { EventCommonSchedule } from '@/features/events/event-detail/common/(components)/event-common-schedule';
import messages from '@/messages/en.json';

describe('EventCommonSchedule', () => {
  it('shows setup, event, and teardown dates in two rows of three fields', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <EventCommonSchedule
          namespace="eventDetail"
          event={{
            id: 'event-1',
            name: 'Launch',
            createdAt: '2026-08-01T08:00:00Z',
            startTime: '2026-08-02T10:00:00Z',
            endTime: '2026-08-02T18:00:00Z',
            logistics: {
              setup: {
                start: '2026-08-01T10:00:00Z',
                end: '2026-08-01T18:00:00Z',
              },
              teardown: {
                start: '2026-08-03T10:00:00Z',
                end: '2026-08-03T18:00:00Z',
              },
            },
          }}
        />
      </NextIntlClientProvider>,
    );

    const labels = screen.getAllByText(/^(Setup|Event|Teardown) (Start|End)$/);
    expect(labels.map((label) => label.textContent)).toEqual([
      'Setup Start',
      'Setup End',
      'Event Start',
      'Event End',
      'Teardown Start',
      'Teardown End',
    ]);
    expect(screen.getByText('August 1, 2026 - 10:00')).toBeInTheDocument();
    expect(screen.getByText('August 1, 2026 - 18:00')).toBeInTheDocument();
    expect(screen.getByText('August 2, 2026 - 10:00')).toBeInTheDocument();
    expect(screen.getByText('August 2, 2026 - 18:00')).toBeInTheDocument();
    expect(screen.getByText('August 3, 2026 - 10:00')).toBeInTheDocument();
    expect(screen.getByText('August 3, 2026 - 18:00')).toBeInTheDocument();
  });
});
