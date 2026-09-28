import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { EventInfoCard } from '@/features/reporting-tool/trade-fair-event-form/(components)/steps/trade-fair-event-form-step-general-info/event-info-card';
import type { TradeFairEventFormDto } from '@/features/reporting-tool/trade-fair-event-form/(helpers)/trade-fair-event-form-schema';

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('nuqs', () => ({ parseAsString: {}, useQueryState: () => ['event-1', vi.fn()] }));
vi.mock('@/features/reporting-tool/trade-fair-event-form/(hooks)/use-trade-fair-event-type', () => ({
  useTradeFairEventType: () => ({ eventTypes: [] }),
}));

function DirtyState() {
  const { formState } = useFormContext<TradeFairEventFormDto>();
  return <output aria-label="Form dirty">{String(formState.isDirty)}</output>;
}

function EventInfoCardHarness() {
  const methods = useForm<TradeFairEventFormDto>({
    defaultValues: {
      title: 'Original title',
      eventMode: '',
      targetAudience: [],
      eventId: 'EVENT-1234567',
      eventType: '',
      description: '',
      participation: '',
    },
  });

  return (
    <FormProvider {...methods}>
      <EventInfoCard />
      <DirtyState />
    </FormProvider>
  );
}

describe('Trade Fair Event EventInfoCard', () => {
  it('caps the description input at the documented maximum', () => {
    render(<EventInfoCardHarness />);

    expect(screen.getByRole('textbox', { name: 'descriptionPlaceholder' }))
      .toHaveAttribute('maxLength', '5000');
  });

  it('marks the edit form dirty after changing its title', async () => {
    const user = userEvent.setup();
    render(<EventInfoCardHarness />);

    const title = screen.getByRole('textbox', { name: 'eventTitle' });
    await user.clear(title);
    await user.type(title, 'Changed title');

    expect(screen.getByRole('status', { name: 'Form dirty' })).toHaveTextContent('true');
  });
});
