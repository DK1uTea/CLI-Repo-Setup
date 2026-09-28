import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { SummaryLogisticsSection } from '@/features/events/event-form/(components)/steps/event-form-step-summary/summary-logistics-section';
import type { EventFormDto } from '@/features/events/event-form/(helpers)/event-form-schema';
import type { EventDetail } from '@/features/events/event-form/(hooks)/use-event-step-detail';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('nuqs', () => ({
  parseAsString: {},
  useQueryState: () => ['event-123'],
}));

vi.mock('@/shared/stores/use-user-store', () => ({
  useDateFormat: () => 'DD.MM.YYYY',
}));

function SummaryLogisticsSectionHarness({ logisticComment = '' }: { logisticComment?: string }) {
  const methods = useForm<EventFormDto>({
    defaultValues: {
      wareHouseCode: 'WH-BER',
      logisticComment,
    },
  });

  return (
    <FormProvider {...methods}>
      <SummaryLogisticsSection />
    </FormProvider>
  );
}

describe('SummaryLogisticsSection', () => {
  it('shows the warehouse name returned by the summary API', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData<EventDetail>(['event-step-detail', 'event-123', 'summary'], {
      logistics: { warehouseName: 'Berlin Warehouse' },
    } as EventDetail);

    render(
      <QueryClientProvider client={queryClient}>
        <SummaryLogisticsSectionHarness />
      </QueryClientProvider>,
    );

    expect(screen.getByText('Berlin Warehouse')).toBeInTheDocument();
    expect(screen.queryByText('WH-BER')).not.toBeInTheDocument();
  });

  it('shows the delivery address from the summary API before the logistics comment', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData<EventDetail>(['event-step-detail', 'event-123', 'summary'], {
      logistics: {
        location: {
          name: 'Delivery Hall',
          street: 'Main Street 12',
          city: 'Berlin',
          state: 'Berlin',
          postalCode: '10115',
        },
      },
    } as EventDetail);

    render(
      <QueryClientProvider client={queryClient}>
        <SummaryLogisticsSectionHarness logisticComment="<p>Use the side entrance</p>" />
      </QueryClientProvider>,
    );

    expect(screen.getByText('summary.deliveryAddress')).toBeInTheDocument();
    expect(screen.getByText('Delivery Hall, Main Street 12, Berlin, Berlin, 10115')).toBeInTheDocument();
    const rowLabels = screen.getAllByRole('row').map((row) => row.firstElementChild?.textContent);
    expect(rowLabels.indexOf('summary.deliveryAddress')).toBeLessThan(
      rowLabels.indexOf('summary.logisticsComment'),
    );
  });

  it('hides the delivery address and logistics comment rows when their values are absent', () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <SummaryLogisticsSectionHarness />
      </QueryClientProvider>,
    );

    expect(screen.queryByText('summary.deliveryAddress')).not.toBeInTheDocument();
    expect(screen.queryByText('summary.logisticsComment')).not.toBeInTheDocument();
  });
});
