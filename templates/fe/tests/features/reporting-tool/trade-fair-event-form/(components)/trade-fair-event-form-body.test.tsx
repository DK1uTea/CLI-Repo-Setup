import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import TradeFairEventFormBody from '@/features/reporting-tool/trade-fair-event-form/(components)/trade-fair-event-form-body';
import type { TradeFairEventFormDto } from '@/features/reporting-tool/trade-fair-event-form/(helpers)/trade-fair-event-form-schema';
import { requestGuardedNavigation } from '@/shared/hooks/common/use-navigation-guard';

vi.mock('@/features/reporting-tool/trade-fair-event-form/(helpers)/trade-fair-event-form-config', () => ({
  TRADE_FAIR_EVENT_FORM_CONFIG: { steps: ['general-info', 'survey'] },
  STEP_COMPONENTS: { 'general-info': () => <div>General info step</div> },
}));
vi.mock('@/features/reporting-tool/trade-fair-event-form/(hooks)/use-trade-fair-event-action', () => ({
  useTradeFairEventActions: () => ({ currentStep: 'general-info' }),
}));
vi.mock('@/features/reporting-tool/trade-fair-event-form/(hooks)/use-submit-step-general-info', () => ({
  useSubmitStepGeneralInfo: () => ({ submit: vi.fn() }),
}));
vi.mock('@/features/reporting-tool/trade-fair-event-form/(hooks)/use-submit-step-survey', () => ({
  useSubmitStepSurvey: () => ({ submit: vi.fn() }),
}));
vi.mock('@/features/reporting-tool/trade-fair-event-form/(components)/trade-fair-event-form-sidebar', () => ({
  default: () => (
    <nav>
      <a href="/reporting-tool">Back</a>
      <button type="button" onClick={() => requestGuardedNavigation(() => undefined)}>
        Survey step
      </button>
    </nav>
  ),
}));
vi.mock('@/shared/components/common/unsaved-changes-dialog', () => ({
  UnsavedChangesDialog: ({ isOpen }: { isOpen: boolean }) => (
    <output aria-label="Unsaved dialog open">{String(isOpen)}</output>
  ),
}));

function BodyHarness() {
  const methods = useForm<TradeFairEventFormDto>({ defaultValues: { title: 'Original title' } });

  return (
    <FormProvider {...methods}>
      <input aria-label="Title" {...methods.register('title')} />
      <TradeFairEventFormBody mode="update" />
    </FormProvider>
  );
}

describe('TradeFairEventFormBody', () => {
  it.each([
    ['a sidebar step', 'Survey step'],
    ['the Back button', 'Back'],
  ])('opens the unsaved dialog when a changed title navigates through %s', async (_case, controlName) => {
    const user = userEvent.setup();
    render(<BodyHarness />);

    await user.clear(screen.getByRole('textbox', { name: 'Title' }));
    await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Changed title');
    await user.click(screen.getByRole(controlName === 'Back' ? 'link' : 'button', { name: controlName }));

    expect(screen.getByRole('status', { name: 'Unsaved dialog open' })).toHaveTextContent('true');
  });
});
