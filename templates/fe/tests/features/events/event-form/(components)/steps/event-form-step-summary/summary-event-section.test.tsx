import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { SummaryEventSection } from '@/features/events/event-form/(components)/steps/event-form-step-summary/summary-event-section';
import type { EventFormDto } from '@/features/events/event-form/(helpers)/event-form-schema';
import type { EventDetail } from '@/features/events/event-form/(hooks)/use-event-step-detail';
import messages from '@/messages/en.json';

vi.mock('nuqs', () => ({
  parseAsString: {},
  useQueryState: () => ['event-123'],
}));

function SummaryEventSectionHarness() {
  const methods = useForm<EventFormDto>({
    defaultValues: {
      title: 'Summer Event',
      participation: 'PERSONAL_INVITATION',
      locationId: 'location-uuid',
    },
  });

  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <FormProvider {...methods}>
        <SummaryEventSection />
      </FormProvider>
    </NextIntlClientProvider>
  );
}

describe('SummaryEventSection', () => {
  it('shows the translated participation label directly below the event name', () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <SummaryEventSectionHarness />
      </QueryClientProvider>,
    );

    const rows = screen.getAllByRole('row');

    expect(within(rows[0]).getByText('Summer Event')).toBeInTheDocument();
    expect(within(rows[1]).getByText('Participation')).toBeInTheDocument();
    expect(within(rows[1]).getByText('Personal invitation')).toBeInTheDocument();
    expect(screen.queryByText('PERSONAL_INVITATION')).not.toBeInTheDocument();
  });

  it('shows the location name returned by the summary API instead of its ID', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData<EventDetail>(['event-step-detail', 'event-123', 'summary'], {
      overview: { location: { name: 'Berlin Convention Center' } },
    } as EventDetail);

    render(
      <QueryClientProvider client={queryClient}>
        <SummaryEventSectionHarness />
      </QueryClientProvider>,
    );

    expect(screen.getByText('Berlin Convention Center')).toBeInTheDocument();
    expect(screen.queryByText('location-uuid')).not.toBeInTheDocument();
  });
});
