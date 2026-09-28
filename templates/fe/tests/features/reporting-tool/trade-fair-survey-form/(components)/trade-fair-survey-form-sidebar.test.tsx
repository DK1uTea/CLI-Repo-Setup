import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import TradeFairSurveyFormSidebar from '@/features/reporting-tool/trade-fair-survey-form/(components)/trade-fair-survey-form-sidebar';
import type { TradeFairSurveyFormDto } from '@/features/reporting-tool/trade-fair-survey-form/(helpers)/trade-fair-survey-form-schema';
import { useUnsavedChanges } from '@/shared/hooks/common/use-unsaved-changes';

const { surveyActions } = vi.hoisted(() => ({
  surveyActions: { currentStep: 'survey' as const, goToStep: vi.fn() },
}));

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('nuqs', () => ({ parseAsString: {}, useQueryState: () => [null, vi.fn()] }));
vi.mock('@/features/reporting-tool/trade-fair-survey-form/(hooks)/use-trade-fair-survey-action', () => ({
  useTradeFairSurveyActions: () => surveyActions,
}));
vi.mock('@/features/reporting-tool/(components)/forward-button', () => ({
  default: () => <a href="/reporting-tool">Back</a>,
}));

function DirtySurveyGuard() {
  const methods = useFormContext<TradeFairSurveyFormDto>();
  const { dialogProps } = useUnsavedChanges({
    isDirty: methods.formState.isDirty,
    onDiscard: () => methods.reset(),
  });

  return (
    <>
      <output aria-label="Unsaved dialog open">{String(dialogProps.isOpen)}</output>
      <button type="button" onClick={dialogProps.onLeave}>Leave without saving</button>
    </>
  );
}

function SidebarHarness() {
  const methods = useForm<TradeFairSurveyFormDto>({
    defaultValues: { name: 'Original survey', steps: [] },
  });

  return (
    <FormProvider {...methods}>
      <input aria-label="Survey name" {...methods.register('name')} />
      <TradeFairSurveyFormSidebar mode="update" />
      <DirtySurveyGuard />
    </FormProvider>
  );
}

describe('TradeFairSurveyFormSidebar', () => {
  beforeEach(() => {
    surveyActions.goToStep.mockReset();
  });

  it('asks before leaving the editable Survey step with unsaved changes', async () => {
    const user = userEvent.setup();
    render(<SidebarHarness />);

    await user.clear(screen.getByRole('textbox', { name: 'Survey name' }));
    await user.type(screen.getByRole('textbox', { name: 'Survey name' }), 'Edited survey');
    await user.click(screen.getByText('steps.assign-users'));

    expect(screen.getByRole('status', { name: 'Unsaved dialog open' })).toHaveTextContent('true');
    expect(surveyActions.goToStep).not.toHaveBeenCalled();
  });

  it('restores the survey baseline before completing a guarded step change', async () => {
    const user = userEvent.setup();
    render(<SidebarHarness />);

    const nameInput = screen.getByRole('textbox', { name: 'Survey name' });
    await user.clear(nameInput);
    await user.type(nameInput, 'Edited survey');
    await user.click(screen.getByText('steps.assign-users'));
    await user.click(screen.getByRole('button', { name: 'Leave without saving' }));

    expect(nameInput).toHaveValue('Original survey');
    expect(surveyActions.goToStep).toHaveBeenCalledWith('assign-users');
  });
});
