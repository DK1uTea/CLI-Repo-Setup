import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';

import { EventScheduleHistoryPopover } from '@/features/events/event-detail/common/(components)/event-schedule-history-popover';
import messages from '@/messages/en.json';

const mockItems = [
  {
    startDate: '2026-09-24T06:00:00.000Z',
    endDate: '2026-09-24T08:00:00.000Z',
    changedAt: '2026-09-24T05:00:00.000Z',
    changedBy: 'Admin User',
    changedByAvatar: null,
  },
];

describe('EventScheduleHistoryPopover', () => {
  it('renders trigger button with accessible label and opens popover with empty state when no history', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <EventScheduleHistoryPopover
          history={[]}
          startLabel="Setup Start"
          endLabel="Setup End"
          namespace="eventDetail"
        />
      </NextIntlClientProvider>,
    );

    const trigger = screen.getByRole('button', { name: 'View edit history' });
    expect(trigger).toBeInTheDocument();

    fireEvent.click(trigger);

    expect(screen.getByText('Date edit history')).toBeInTheDocument();
    expect(screen.getByText('No edit history yet')).toBeInTheDocument();
  });

  it('renders timeline entries when history is provided', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <EventScheduleHistoryPopover
          history={mockItems}
          startLabel="Event Start"
          endLabel="Event End"
          namespace="eventDetail"
        />
      </NextIntlClientProvider>,
    );

    const trigger = screen.getByRole('button', { name: 'View edit history' });
    fireEvent.click(trigger);

    expect(screen.getByText('Date edit history')).toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getByText(/Event Start:/)).toBeInTheDocument();
  });
});
