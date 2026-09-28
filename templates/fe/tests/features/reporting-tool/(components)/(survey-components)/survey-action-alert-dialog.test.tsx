import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import SurveyActionAlertDialog from '@/features/reporting-tool/(components)/(survey-components)/survey-action-alert-dialog';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('SurveyActionAlertDialog', () => {
  it('shows a loading spinner on the confirm button and disables both actions while assign is pending', () => {
    render(
      <SurveyActionAlertDialog
        surveyName="Monster Energy"
        action="assign"
        open
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        isPending
      />,
    );

    expect(screen.queryByRole('button', { name: 'assign' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'cancel' })).toBeDisabled();
  });

  it('shows the confirm action label and an enabled confirm button when not pending', () => {
    render(
      <SurveyActionAlertDialog
        surveyName="Monster Energy"
        action="assign"
        open
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'assign' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'cancel' })).toBeEnabled();
  });
});
