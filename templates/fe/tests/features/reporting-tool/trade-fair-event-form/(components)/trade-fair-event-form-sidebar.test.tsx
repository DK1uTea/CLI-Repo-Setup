import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import TradeFairEventFormSidebar from '@/features/reporting-tool/trade-fair-event-form/(components)/trade-fair-event-form-sidebar';
import type { TradeFairEventFormDto } from '@/features/reporting-tool/trade-fair-event-form/(helpers)/trade-fair-event-form-schema';
import { useUnsavedChanges } from '@/shared/hooks/common/use-unsaved-changes';

const { eventActions, submitGeneralInfo, submitSurvey } = vi.hoisted(() => ({
  eventActions: { currentStep: 'survey' as 'general-info' | 'survey', goToStep: vi.fn() },
  submitGeneralInfo: vi.fn().mockResolvedValue(true),
  submitSurvey: vi.fn().mockResolvedValue(true),
}));

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('nuqs', () => ({
  parseAsString: {},
  useQueryState: (key: string) => [key === 'returnEventId' ? 'event-2' : null, vi.fn()],
}));
vi.mock('@/features/reporting-tool/trade-fair-event-form/(hooks)/use-trade-fair-event-action', () => ({
  useTradeFairEventActions: () => eventActions,
}));
vi.mock('@/features/reporting-tool/trade-fair-event-form/(hooks)/use-submit-step-general-info', () => ({
  useSubmitStepGeneralInfo: () => ({ submit: submitGeneralInfo, isPending: false }),
}));
vi.mock('@/features/reporting-tool/trade-fair-event-form/(hooks)/use-submit-step-survey', () => ({
  useSubmitStepSurvey: () => ({ submit: submitSurvey, isPending: false }),
}));
vi.mock('@/features/reporting-tool/(components)/forward-button', () => ({
  default: ({ href }: { href: string }) => <a href={href}>Back</a>,
}));

function DirtyFormGuard() {
  const methods = useFormContext<TradeFairEventFormDto>();
  const { dialogProps } = useUnsavedChanges({
    isDirty: methods.formState.isDirty,
    onDiscard: () => methods.reset(),
  });

  return <output aria-label="Unsaved dialog open">{String(dialogProps.isOpen)}</output>;
}

function SidebarHarness({ mode = 'update' }: { mode?: 'create' | 'update' }) {
  const methods = useForm<TradeFairEventFormDto>({ defaultValues: { title: 'Original' } });

  return (
    <FormProvider {...methods}>
      <input aria-label="Title" {...methods.register('title')} />
      <TradeFairEventFormSidebar mode={mode} />
      <DirtyFormGuard />
    </FormProvider>
  );
}

describe('TradeFairEventFormSidebar', () => {
  beforeEach(() => {
    eventActions.currentStep = 'survey';
    eventActions.goToStep.mockReset();
    submitGeneralInfo.mockClear();
    submitSurvey.mockClear();
  });

  it('asks before changing to a previous step when the form has unsaved changes', async () => {
    const user = userEvent.setup();
    render(<SidebarHarness />);

    await user.clear(screen.getByRole('textbox', { name: 'Title' }));
    await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Changed');
    await user.click(screen.getByText('steps.general-info'));

    expect(screen.getByRole('status', { name: 'Unsaved dialog open' })).toHaveTextContent('true');
    expect(eventActions.goToStep).not.toHaveBeenCalled();
  });

  it('changes step without submitting when the current form has no changes', async () => {
    const user = userEvent.setup();
    eventActions.currentStep = 'general-info';
    render(<SidebarHarness />);

    await user.click(screen.getByText('steps.survey'));

    expect(submitGeneralInfo).not.toHaveBeenCalled();
    expect(submitSurvey).not.toHaveBeenCalled();
    expect(eventActions.goToStep).toHaveBeenCalledWith('survey');
  });

  it('returns a new event form to the originating event dashboard', () => {
    render(<SidebarHarness mode="create" />);

    expect(screen.getAllByRole('link', { name: 'Back' })[0]).toHaveAttribute(
      'href',
      '/reporting-tool?tab=dashboard&eventId=event-2',
    );
  });

  it('opens the dialog instead of submitting when changing forward from a dirty form', async () => {
    const user = userEvent.setup();
    eventActions.currentStep = 'general-info';
    render(<SidebarHarness />);

    await user.clear(screen.getByRole('textbox', { name: 'Title' }));
    await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Changed');
    await user.click(screen.getByText('steps.survey'));

    expect(screen.getByRole('status', { name: 'Unsaved dialog open' })).toHaveTextContent('true');
    expect(submitGeneralInfo).not.toHaveBeenCalled();
    expect(eventActions.goToStep).not.toHaveBeenCalled();
  });
});
