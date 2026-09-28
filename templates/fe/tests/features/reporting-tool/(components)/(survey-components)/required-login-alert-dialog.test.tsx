import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import RequiredLoginAlertDialog from '@/features/reporting-tool/(components)/(survey-components)/required-login-alert-dialog';
import { TooltipProvider } from '@/shared/components/ui/tooltip';

const { isUpdatingState } = vi.hoisted(() => ({
  isUpdatingState: { value: false },
}));

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('@/features/reporting-tool/(hooks)/(survey-hooks)/use-survey-required-login', () => ({
  useSurveyRequiredLogin: () => ({ updateRequiredLogin: vi.fn(), isUpdating: isUpdatingState.value }),
}));

describe('RequiredLoginAlertDialog', () => {
  it('shows the confirm label when idle', async () => {
    isUpdatingState.value = false;
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <RequiredLoginAlertDialog requiredLogin={false} eventSurveyId="event-survey-1" />
      </TooltipProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'enableLabel' }));

    expect(screen.getByRole('button', { name: 'confirm' })).toBeEnabled();
  });

  it('replaces the confirm label with a loading spinner, and disables both actions, while the update is pending', async () => {
    isUpdatingState.value = true;
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <RequiredLoginAlertDialog requiredLogin={false} eventSurveyId="event-survey-1" />
      </TooltipProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'enableLabel' }));

    expect(screen.queryByRole('button', { name: 'confirm' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'cancel' })).toBeDisabled();
  });
});
