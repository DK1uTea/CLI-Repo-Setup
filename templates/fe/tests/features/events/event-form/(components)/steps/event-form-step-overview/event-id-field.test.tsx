import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { EventIdField } from '@/features/events/event-form/(components)/steps/event-form-step-overview/event-id-field';
import { eventFormSchema, type EventFormDto } from '@/features/events/event-form/(helpers)/event-form-schema';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

function EventIdFieldHarness() {
  const methods = useForm<EventFormDto>({
    resolver: zodResolver(eventFormSchema),
    mode: 'onChange',
    defaultValues: { customEventId: '' },
  });

  return (
    <FormProvider {...methods}>
      <EventIdField />
    </FormProvider>
  );
}

describe('EventIdField', () => {
  it('accepts a non-empty Event ID without enforcing a format', async () => {
    const user = userEvent.setup();

    render(<EventIdFieldHarness />);

    const field = screen.getByLabelText('overview.eventId');
    await user.type(field, 'my-custom-id');

    expect(screen.queryByText('fieldErrors.eventIdFormat')).not.toBeInTheDocument();
    expect(field).not.toHaveAttribute('aria-invalid');
  });

  it('still requires an Event ID', async () => {
    const user = userEvent.setup();
    render(<EventIdFieldHarness />);

    const field = screen.getByLabelText('overview.eventId');
    await user.type(field, 'temporary');
    await user.clear(field);

    expect(await screen.findByText('fieldErrors.required')).toBeVisible();
    expect(field).toHaveAttribute('aria-invalid', 'true');
  });
});
