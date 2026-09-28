import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import SurveyItemCard from '@/features/reporting-tool/survey-builder/(components)/survey-item-card';
import type { Survey } from '@/features/reporting-tool/(helpers)/trade-fair-event-type';

const { isAnyActionPendingState, isMutatingState } = vi.hoisted(() => ({
  isAnyActionPendingState: { value: false },
  isMutatingState: { value: false },
}));

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('nuqs', () => ({
  parseAsString: {},
  useQueryState: () => ['event-1'],
}));
vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/reporting-tool',
  Link: ({ children, href, ...props }: React.ComponentProps<'a'>) => (
    <a href={href} {...props}>{children}</a>
  ),
}));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock('@/features/reporting-tool/(hooks)/(survey-hooks)/use-event-surveys-action', () => ({
  useEventSurveysAction: () => ({
    assignSurvey: vi.fn(() => new Promise(() => {})),
    unassignSurvey: vi.fn(),
    isMutating: isMutatingState.value,
  }),
}));
vi.mock('@/features/reporting-tool/(hooks)/(survey-hooks)/use-delete-survey', () => ({
  useDeleteSurvey: () => ({ deleteSurvey: vi.fn() }),
}));
vi.mock('@/features/reporting-tool/(hooks)/(survey-hooks)/use-duplicate-survey', () => ({
  useDuplicateSurvey: () => ({ duplicateSurvey: vi.fn() }),
}));
vi.mock('@/features/reporting-tool/(hooks)/(survey-hooks)/use-is-any-survey-action-pending', () => ({
  useIsAnySurveyActionPending: () => isAnyActionPendingState.value,
}));

const survey: Survey = {
  id: 'survey-1',
  name: 'Monster Energy',
  totalQuestions: 17,
  canEdit: true,
};

describe('SurveyItemCard', () => {
  it('keeps Add to event and the actions menu enabled when no survey action is pending elsewhere', () => {
    isAnyActionPendingState.value = false;
    isMutatingState.value = false;
    render(<SurveyItemCard survey={survey} />);

    const addButtons = screen.getAllByRole('button', { name: 'addToEvent' });
    addButtons.forEach((button) => expect(button).toBeEnabled());
  });

  it('disables Add to event and the actions menu while any survey action is pending on another card', () => {
    isAnyActionPendingState.value = true;
    isMutatingState.value = false;
    render(<SurveyItemCard survey={survey} />);

    const addButtons = screen.getAllByRole('button', { name: 'addToEvent' });
    addButtons.forEach((button) => expect(button).toBeDisabled());
  });

  it('shows a loading spinner on the Add to event button that was just clicked, once its own assign mutation is pending', async () => {
    isAnyActionPendingState.value = false;
    isMutatingState.value = false;
    const user = userEvent.setup();
    const { rerender } = render(<SurveyItemCard survey={survey} />);

    const [desktopAddButton] = screen.getAllByRole('button', { name: 'addToEvent' });
    await user.click(desktopAddButton);
    await user.click(screen.getByRole('button', { name: 'assign' }));

    isMutatingState.value = true;
    rerender(<SurveyItemCard survey={survey} />);

    expect(screen.queryAllByRole('button', { name: 'addToEvent' })).toHaveLength(0);
  });
});
