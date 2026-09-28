import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { DateCard } from '@/features/events/event-form/(components)/steps/event-form-step-overview/date-card';
import {
  eventFormSchema,
  type EventFormDto,
} from '@/features/events/event-form/(helpers)/event-form-schema';

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('nuqs', () => ({ parseAsString: {}, useQueryState: () => [null] }));
vi.mock('@/features/events/(stores)/use-event-detail-store', () => ({
  useEventDetailStore: (selector: (state: { canEdit: boolean; isOverviewLocked: boolean }) => unknown) =>
    selector({ canEdit: true, isOverviewLocked: false }),
}));
vi.mock('@/features/events/event-form/(hooks)/use-event-deadline', () => ({
  useEventDeadline: () => ({ data: undefined }),
}));
vi.mock('@/shared/components/ui/date-input-float', () => ({
  DateInputFloat: ({ onChangeAction, error, overlay }: { onChangeAction: (date: Date) => void; error?: string; overlay?: string }) => (
    <div data-testid="date-input" data-overlay={overlay}>
      <button type="button" onClick={() => onChangeAction(new Date('2026-08-05T01:00:00Z'))}>
        Change date time
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  ),
}));

function DateCardHarness() {
  const methods = useForm<EventFormDto>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      customEventId: 'EVENT-123',
      title: 'Test Event',
      mode: 'FACE_TO_FACE',
      targetAudience: ['CONSUMER'],
      eventTypeId: 'type-1',
      doNotPublish: false,
      shortDescription: 'Description',
      participation: 'NOT_POSSIBLE',
      images: [],
      startDate: '2026-08-05',
      startTime: '00:00',
      endDate: '2026-08-05',
      endTime: '00:00',
      address: 'Venue',
      street: 'Street 1',
      zipCode: '10115',
      city: 'Berlin',
      isSaveAddress: false,
      contactFirstName: 'Ada',
      contactLastName: 'Lovelace',
      contactEmail: 'ada@example.com',
      contactPhone: '+49123456',
      contacts: [],
      partnershipTypes: ['KEYNOTE_SPEAKER'],
      productPartnerCategories: [],
      wareHouseCode: 'WH-1',
      logisticsContactName: 'Logistics Contact',
      logisticsContactEmail: 'logistics@example.com',
      logisticsContactPhone: '+491701234567',
      isDifferentDeliveryAddress: false,
      deliveryLocations: [],
      setupStartDate: '2026-08-04',
      setupStartTime: '08:00',
      setupEndDate: '2026-08-04',
      setupEndTime: '09:00',
      teardownStartDate: '2026-08-06',
      teardownStartTime: '08:00',
      teardownEndDate: '2026-08-06',
      teardownEndTime: '09:00',
    },
  });

  useEffect(() => {
    void methods.trigger(['endDate', 'endTime']);
  }, [methods]);

  return (
    <FormProvider {...methods}>
      <DateCard />
    </FormProvider>
  );
}

describe('DateCard', () => {
  it('opens both date-time fields in dialog overlays', () => {
    render(<DateCardHarness />);

    expect(screen.getAllByTestId('date-input')).toHaveLength(2);
    screen.getAllByTestId('date-input').forEach((input) => {
      expect(input).toHaveAttribute('data-overlay', 'dialog');
    });
  });

  it('clears the end-date error when a later end time makes the same-day range valid', async () => {
    const user = userEvent.setup();
    render(<DateCardHarness />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'fieldErrors.endDateAfterStartDate',
    );

    await user.click(screen.getAllByRole('button', { name: 'Change date time' })[1]);

    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });
});
import { zodResolver } from '@hookform/resolvers/zod';
