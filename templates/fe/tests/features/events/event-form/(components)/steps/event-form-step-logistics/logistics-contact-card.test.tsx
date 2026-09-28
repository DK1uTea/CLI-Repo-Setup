import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { LogisticsContactCard } from '@/features/events/event-form/(components)/steps/event-form-step-logistics/logistics-contact-card';
import { eventFormSchema, type EventFormDto } from '@/features/events/event-form/(helpers)/event-form-schema';
import { dayjs, nowUtc } from '@/lib/date-utils';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('nuqs', () => ({
  parseAsString: {},
  useQueryState: () => [null, vi.fn()],
}));

vi.mock('@/features/events/(stores)/use-event-detail-store', () => ({
  useEventDetailStore: (selector: (state: { canEdit: boolean }) => unknown) => selector({ canEdit: true }),
}));

vi.mock('@/features/events/event-form/(hooks)/use-logistics-filter-config', () => ({
  useLogisticsFilterConfig: () => ({ data: { warehouses: [] }, isLoading: false }),
}));

vi.mock('@/shared/components/ui/date-input-float', () => ({
  DateInputFloat: ({ allowPastDates, minDate, onChangeAction, error, warning, overlay }: {
    allowPastDates?: boolean;
    minDate?: Date;
    onChangeAction: (date: Date) => void;
    error?: string;
    warning?: string;
    overlay?: string;
  }) => (
    <div data-testid="date-input" data-overlay={overlay} data-allow-past={String(Boolean(allowPastDates))} data-min-date={minDate?.toISOString().slice(0, 10)}>
      <button type="button" onClick={() => onChangeAction(dayjs.utc('2026-08-05T00:00:00Z').toDate())}>Make invalid</button>
      <button type="button" onClick={() => onChangeAction(dayjs.utc('2026-08-05T01:00:00Z').toDate())}>Make valid</button>
      {error && <p role="alert">{error}</p>}
      {warning && <p role="status">{warning}</p>}
    </div>
  ),
}));

function LogisticsContactCardHarness({ invalidRange }: { invalidRange?: 'setup' | 'teardown' }) {
  const methods = useForm<EventFormDto>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      customEventId: 'EVENT-123', title: 'Test Event', mode: 'FACE_TO_FACE',
      targetAudience: ['CONSUMER'], eventTypeId: 'type-1', doNotPublish: false,
      shortDescription: 'Description', participation: 'NOT_POSSIBLE', images: [],
      startDate: '2026-08-05', startTime: '00:00', endDate: '2026-08-05', endTime: '01:00',
      address: 'Venue', street: 'Street 1', zipCode: '10115', city: 'Berlin',
      isSaveAddress: false, contactFirstName: 'Ada', contactLastName: 'Lovelace',
      contactEmail: 'ada@example.com', contactPhone: '+49123456', contacts: [],
      partnershipTypes: ['KEYNOTE_SPEAKER'], productPartnerCategories: [],
      wareHouseCode: 'WH-1', logisticsContactName: 'Logistics Contact',
      logisticsContactEmail: 'logistics@example.com', logisticsContactPhone: '+491701234567',
      isDifferentDeliveryAddress: false,
      deliveryLocations: [],
      setupStartDate: '2026-08-05', setupStartTime: '00:00',
      setupEndDate: '2026-08-05', setupEndTime: '01:00',
      teardownStartDate: '2026-08-05', teardownStartTime: '00:00',
      teardownEndDate: '2026-08-05', teardownEndTime: '01:00',
    },
  });

  const prepareError = async () => {
    if (!invalidRange) return;
    const prefix = invalidRange === 'setup' ? 'setup' : 'teardown';
    methods.setValue(`${prefix}EndDate`, '2026-08-05');
    methods.setValue(`${prefix}EndTime`, '00:00');
    await methods.trigger([
      `${prefix}StartDate`,
      `${prefix}StartTime`,
      `${prefix}EndDate`,
      `${prefix}EndTime`,
    ]);
  };

  return (
    <FormProvider {...methods}>
      {invalidRange && <button type="button" onClick={() => void prepareError()}>Prepare error</button>}
      <LogisticsContactCard />
    </FormProvider>
  );
}

describe('LogisticsContactCard dates', () => {
  it('uses today as the minimum date for Setup and Teardown', () => {
    render(<LogisticsContactCardHarness />);

    const dateInputs = screen.getAllByTestId('date-input');
    const today = dayjs.utc(nowUtc()).format('YYYY-MM-DD');

    dateInputs.forEach((input) => expect(input).toHaveAttribute('data-overlay', 'dialog'));
    dateInputs.forEach((input) => {
      expect(input).toHaveAttribute('data-min-date', today);
      expect(input).toHaveAttribute('data-allow-past', 'false');
    });
  });

  it('shows overlap warnings without validation errors', () => {
    render(<LogisticsContactCardHarness />);

    expect(screen.getAllByRole('status').map((warning) => warning.textContent)).toEqual([
      'logistics.setupOverlapsEvent',
      'logistics.teardownOverlapsEvent',
    ]);
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
  });

  it.each([
    ['setup', 1],
    ['teardown', 3],
  ])('clears the %s end error when a later end time makes the same-day range valid', async (range, inputIndex) => {
    const user = userEvent.setup();
    render(<LogisticsContactCardHarness invalidRange={range as 'setup' | 'teardown'} />);
    const dateInput = screen.getAllByTestId('date-input')[inputIndex];

    await user.click(screen.getByRole('button', { name: 'Prepare error' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(`${range}StartBeforeEnd`);

    await user.click(dateInput.querySelectorAll('button')[1]);
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });
});
