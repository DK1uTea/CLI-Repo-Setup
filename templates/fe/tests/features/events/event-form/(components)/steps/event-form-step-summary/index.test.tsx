import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { EventFormStepSummary } from '@/features/events/event-form/(components)/steps/event-form-step-summary';
import type { EventFormDto } from '@/features/events/event-form/(helpers)/event-form-schema';
import deMessages from '@/messages/de.json';
import enMessages from '@/messages/en.json';

vi.mock('nuqs', () => ({
  parseAsString: {},
  useQueryState: () => ['event-123'],
}));

vi.mock('@/shared/hooks/common/use-unsaved-changes', () => ({
  useUnsavedChanges: () => ({ dialogProps: {} }),
}));

vi.mock('@/shared/components/common/unsaved-changes-dialog', () => ({
  UnsavedChangesDialog: () => null,
}));

vi.mock('@/features/events/event-form/(components)/steps/event-form-step-summary/summary-event-section', () => ({
  SummaryEventSection: () => <div>Event details</div>,
}));

vi.mock('@/features/events/event-form/(components)/steps/event-form-step-summary/summary-logistics-section', () => ({
  SummaryLogisticsSection: () => <div>Logistics details</div>,
}));

vi.mock('@/features/events/event-form/(components)/steps/event-form-step-summary/summary-files-section', () => ({
  SummaryFilesSection: () => <div>File details</div>,
}));

vi.mock('@/features/events/event-form/(components)/steps/event-form-step-summary/summary-cart-section', () => ({
  SummaryCartSection: () => <div>Product details</div>,
}));

vi.mock('@/features/events/event-form/(components)/steps/event-form-step-summary/summary-map', () => ({
  SummaryMap: () => <div>Map</div>,
}));

function SummaryHarness({ locale }: { locale: 'de' | 'en' }) {
  const methods = useForm<EventFormDto>();
  const messages = locale === 'de' ? deMessages : enMessages;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <QueryClientProvider client={new QueryClient()}>
        <FormProvider {...methods}>
          <EventFormStepSummary />
        </FormProvider>
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
}

describe('EventFormStepSummary', () => {
  it.each([
    ['en', 'Review all event details, including products, tickets, services, transport, and total costs.'],
    ['de', 'Überprüfen Sie alle Event-Details, einschließlich Produkte, Tickets, Dienstleistungen, Transport und Gesamtkosten.'],
  ] as const)('shows the Event Summary description in %s', (locale, description) => {
    render(<SummaryHarness locale={locale} />);

    expect(screen.getByText(description)).toBeInTheDocument();
  });
});
