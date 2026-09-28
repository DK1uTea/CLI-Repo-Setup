import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { EventFormStepOverview } from '@/features/events/event-form/(components)/steps/event-form-step-overview';
import type { EventFormDto } from '@/features/events/event-form/(helpers)/event-form-schema';
import { TooltipProvider } from '@/shared/components/ui/tooltip';

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('nuqs', () => ({ parseAsString: {}, useQueryState: () => [null, vi.fn()] }));
vi.mock('@/features/events/(stores)/use-event-detail-store', () => ({
  useEventDetailStore: (selector: (state: { canEdit: boolean; isOverviewLocked: boolean }) => unknown) =>
    selector({ canEdit: true, isOverviewLocked: false }),
}));
vi.mock('@/features/events/event-form/(hooks)/use-get-event-type', () => ({
  useGetEventType: () => ({ eventTypes: [] }),
}));
vi.mock('@/features/events/event-form/(hooks)/use-permanent-loan-privacy', () => ({
  usePermanentLoanPrivacy: () => ({ isPermanentLoan: false, applyEventTypePrivacy: vi.fn() }),
}));
vi.mock('@/features/events/event-form/(components)/steps/event-form-step-overview/images-card', () => ({ ImagesCard: () => null }));
vi.mock('@/features/events/event-form/(components)/steps/event-form-step-overview/date-card', () => ({ DateCard: () => null }));
vi.mock('@/features/events/event-form/(components)/steps/event-form-step-overview/location-card', () => ({ LocationCard: () => null }));
vi.mock('@/features/events/event-form/(components)/steps/event-form-step-overview/contact-card', () => ({ ContactCard: () => null }));
vi.mock('@/features/events/event-form/(components)/steps/event-form-step-overview/partnership-card', () => ({ PartnershipCard: () => null }));
vi.mock('@/features/events/event-form/(components)/steps/event-form-step-overview/event-id-field', () => ({ EventIdField: () => null }));

const { submitEventOverviewMock, submitCalendarEventMock } = vi.hoisted(() => ({
  submitEventOverviewMock: vi.fn().mockResolvedValue(true),
  submitCalendarEventMock: vi.fn().mockResolvedValue(true),
}));
vi.mock('@/features/events/event-form/(hooks)/use-submit-step-overview', () => ({
  useSubmitStepOverview: () => ({ submit: submitEventOverviewMock }),
}));
vi.mock('@/features/calendar/calendar-event-form/(hooks)/use-submit-calendar-event', () => ({
  useSubmitCalendarEvent: () => ({ submit: submitCalendarEventMock }),
}));

function Harness({ variant }: { variant?: 'events' | 'calendar' }) {
  const methods = useForm<EventFormDto>({ defaultValues: {}, mode: 'onChange' });
  // isDirty only flips true once react-hook-form registers the field being changed —
  // register it via a real input so the guard actually arms, same as the real form does.
  return (
    <TooltipProvider>
      <FormProvider {...methods}>
        <input {...methods.register('title')} aria-label="title" />
        <a href="/other-page">Leave</a>
        <EventFormStepOverview variant={variant} />
      </FormProvider>
    </TooltipProvider>
  );
}

describe('EventFormStepOverview — submit function selection by variant (Confirm Leave Page / Save & Leave)', () => {
  it('calls the calendar submit function, not the events one, on Save & Leave when variant is calendar', async () => {
    render(<Harness variant="calendar" />);

    fireEvent.change(screen.getByLabelText('title'), { target: { value: 'Changed' } });
    fireEvent.click(screen.getByRole('link', { name: 'Leave' }));

    const saveAndLeave = await screen.findByRole('button', { name: /saveAndLeave/ });
    fireEvent.click(saveAndLeave);

    await waitFor(() => expect(submitCalendarEventMock).toHaveBeenCalledOnce());
    expect(submitEventOverviewMock).not.toHaveBeenCalled();
  });

  it('calls the events submit function, not the calendar one, on Save & Leave when variant is events (default)', async () => {
    render(<Harness />);

    fireEvent.change(screen.getByLabelText('title'), { target: { value: 'Changed' } });
    fireEvent.click(screen.getByRole('link', { name: 'Leave' }));

    const saveAndLeave = await screen.findByRole('button', { name: /saveAndLeave/ });
    fireEvent.click(saveAndLeave);

    await waitFor(() => expect(submitEventOverviewMock).toHaveBeenCalledOnce());
    expect(submitCalendarEventMock).not.toHaveBeenCalled();
  });
});
