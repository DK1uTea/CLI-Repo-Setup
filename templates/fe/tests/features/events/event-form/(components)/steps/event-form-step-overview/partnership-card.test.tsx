import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { PartnershipCard } from '@/features/events/event-form/(components)/steps/event-form-step-overview/partnership-card';
import type { EventFormDto } from '@/features/events/event-form/(helpers)/event-form-schema';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('nuqs', () => ({
  parseAsString: {},
  useQueryState: () => [null, vi.fn()],
}));

vi.mock('@/features/events/(stores)/use-event-detail-store', () => ({
  useEventDetailStore: (selector: (state: { canEdit: boolean; isOverviewLocked: boolean }) => unknown) =>
    selector({ canEdit: true, isOverviewLocked: false }),
}));

function PartnershipCardHarness({ defaultValues }: { defaultValues?: Partial<EventFormDto> }) {
  const methods = useForm<EventFormDto>({
    defaultValues: { partnershipTypes: [], productPartnerCategories: [], ...defaultValues },
  });

  return (
    <FormProvider {...methods}>
      <PartnershipCard />
    </FormProvider>
  );
}

describe('PartnershipCard', () => {
  it('renders every partnership option', () => {
    render(<PartnershipCardHarness />);

    for (const label of ['Product Partner', 'Keynote Speaker', 'Exhibition', 'Jury Member', 'Media Partner']) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
  });

  it('does not show Product Partner categories until Product Partner is checked', () => {
    render(<PartnershipCardHarness />);

    expect(screen.queryByLabelText('Softdrinks')).not.toBeInTheDocument();
  });

  it('reveals categories without auto-checking any of them when Product Partner is ticked', async () => {
    const user = userEvent.setup();
    render(<PartnershipCardHarness />);

    await user.click(screen.getByLabelText('Product Partner'));

    expect(screen.getByLabelText('Softdrinks')).toBeInTheDocument();
    expect(screen.getByLabelText('Softdrinks')).not.toBeChecked();
  });

  it('hides the categories again when Product Partner is unticked', async () => {
    const user = userEvent.setup();
    render(<PartnershipCardHarness />);

    await user.click(screen.getByLabelText('Product Partner'));
    expect(screen.getByLabelText('Softdrinks')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Product Partner'));

    expect(screen.queryByLabelText('Softdrinks')).not.toBeInTheDocument();
  });

  it('supports ticking multiple partnership types at once', async () => {
    const user = userEvent.setup();
    render(<PartnershipCardHarness />);

    await user.click(screen.getByLabelText('Exhibition'));
    await user.click(screen.getByLabelText('Media Partner'));

    expect(screen.getByLabelText('Exhibition')).toBeChecked();
    expect(screen.getByLabelText('Media Partner')).toBeChecked();
  });

  it('clears previously-selected categories when Product Partner is unticked (case: switching away)', async () => {
    const user = userEvent.setup();
    render(<PartnershipCardHarness defaultValues={{ partnershipTypes: ['PRODUCT_PARTNER'], productPartnerCategories: ['SOFTDRINKS'] }} />);

    expect(screen.getByLabelText('Softdrinks')).toBeChecked();

    await user.click(screen.getByLabelText('Product Partner'));

    // Re-checking Product Partner should show a freshly-cleared category list.
    await user.click(screen.getByLabelText('Product Partner'));
    expect(screen.getByLabelText('Softdrinks')).not.toBeChecked();
  });
});
