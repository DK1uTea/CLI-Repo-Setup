import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { DateCard } from '@/features/reporting-tool/trade-fair-event-form/(components)/steps/trade-fair-event-form-step-general-info/date-card';
import type { TradeFairEventFormDto } from '@/features/reporting-tool/trade-fair-event-form/(helpers)/trade-fair-event-form-schema';

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('@/shared/components/ui/date-input-float', () => ({
  DateInputFloat: ({
    onChangeAction,
    dateLabel,
    overlay,
  }: {
    onChangeAction: (date: Date) => void;
    dateLabel: string;
    overlay?: string;
  }) => (
    <button
      type="button"
      data-testid="date-input"
      data-overlay={overlay}
      onClick={() => onChangeAction(new Date('2030-01-02T10:30:00Z'))}
    >
      Change {dateLabel}
    </button>
  ),
}));

function DirtyState() {
  const { formState } = useFormContext<TradeFairEventFormDto>();
  return <output aria-label="Form dirty">{String(formState.isDirty)}</output>;
}

function DateCardHarness() {
  const methods = useForm<TradeFairEventFormDto>({
    defaultValues: {
      startDate: '2029-01-01',
      startTime: '09:00',
      endDate: '2029-01-02',
      endTime: '09:00',
    },
  });

  return (
    <FormProvider {...methods}>
      <DateCard />
      <DirtyState />
    </FormProvider>
  );
}

describe('Trade Fair Event DateCard', () => {
  it('opens both date-time fields in dialog overlays', () => {
    render(<DateCardHarness />);

    expect(screen.getAllByTestId('date-input')).toHaveLength(2);
    screen.getAllByTestId('date-input').forEach((input) => {
      expect(input).toHaveAttribute('data-overlay', 'dialog');
    });
  });

  it('marks the form dirty after changing an event date', async () => {
    const user = userEvent.setup();
    render(<DateCardHarness />);

    await user.click(screen.getAllByRole('button', { name: 'Change date' })[0]);

    expect(screen.getByRole('status', { name: 'Form dirty' })).toHaveTextContent('true');
  });
});
