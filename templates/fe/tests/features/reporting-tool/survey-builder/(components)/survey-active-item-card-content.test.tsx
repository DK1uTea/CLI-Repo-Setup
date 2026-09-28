import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SurveyActiveItemCardContent } from '@/features/reporting-tool/survey-builder/(components)/survey-active-item-card-content';
import type { EventSurvey } from '@/features/reporting-tool/(helpers)/trade-fair-event-type';

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
vi.mock('@/features/reporting-tool/(components)/(survey-components)/required-login-alert-dialog', () => ({
  default: () => null,
}));
vi.mock('@/features/reporting-tool/(components)/(assign-team-components)/share-invite-link-dialog', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const eventSurvey: EventSurvey = {
  id: 'survey-1',
  eventSurveyId: 'event-survey-1',
  name: 'Monster Energy',
  description: '',
  totalQuestions: 17,
  assignmentCount: 0,
  assignments: [],
  requiredLogin: true,
  canEdit: true,
};

const baseProps = {
  eventSurvey,
  hasAssignments: false,
  assignments: [],
  remainingAssignmentsCount: 0,
  openAssignUsersDialog: vi.fn(),
  setDialogAction: vi.fn(),
};

describe('SurveyActiveItemCardContent', () => {
  it('keeps Unassign survey, Assign users, and the actions menu enabled by default', () => {
    render(<SurveyActiveItemCardContent {...baseProps} />);

    screen.getAllByRole('button', { name: 'unassignSurvey' }).forEach((btn) => expect(btn).toBeEnabled());
    screen.getAllByRole('button', { name: 'assignUsers' }).forEach((btn) => expect(btn).toBeEnabled());
  });

  it('disables Unassign survey, Assign users, and the actions menu while another card has a pending survey action', () => {
    render(<SurveyActiveItemCardContent {...baseProps} disabled />);

    screen.getAllByRole('button', { name: 'unassignSurvey' }).forEach((btn) => expect(btn).toBeDisabled());
    screen.getAllByRole('button', { name: 'assignUsers' }).forEach((btn) => expect(btn).toBeDisabled());
  });

  it('shows a loading spinner on Unassign survey while this card is unassigning', () => {
    render(<SurveyActiveItemCardContent {...baseProps} isUnassigning />);

    expect(screen.queryAllByRole('button', { name: 'unassignSurvey' })).toHaveLength(0);
  });
});
