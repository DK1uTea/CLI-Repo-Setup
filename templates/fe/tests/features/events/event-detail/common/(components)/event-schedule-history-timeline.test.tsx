import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';

import { EventScheduleHistoryTimeline } from '@/features/events/event-detail/common/(components)/event-schedule-history-timeline';
import messages from '@/messages/en.json';

const mockItems = [
  {
    startDate: '2026-09-24T06:00:00.000Z',
    endDate: '2026-09-24T08:00:00.000Z',
    changedAt: '2026-09-24T05:00:00.000Z',
    changedBy: 'John Doe',
    changedByAvatar: 'https://example.com/avatar.png',
  },
  {
    startDate: '2026-09-24T05:00:00.000Z',
    endDate: '2026-09-24T07:00:00.000Z',
    changedAt: '2026-09-23T10:00:00.000Z',
    changedBy: 'Jane Smith',
    changedByAvatar: null,
  },
];

describe('EventScheduleHistoryTimeline', () => {
  it('renders schedule history entries with user names, badges, and labels', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <EventScheduleHistoryTimeline
          items={mockItems}
          startLabel="Setup Start"
          endLabel="Setup End"
          namespace="eventDetail"
        />
      </NextIntlClientProvider>,
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getByText('Original')).toBeInTheDocument();

    const startLabels = screen.getAllByText(/Setup Start:/);
    const endLabels = screen.getAllByText(/Setup End:/);
    expect(startLabels).toHaveLength(2);
    expect(endLabels).toHaveLength(2);

    expect(screen.getByText('JS')).toBeInTheDocument();
  });
});
