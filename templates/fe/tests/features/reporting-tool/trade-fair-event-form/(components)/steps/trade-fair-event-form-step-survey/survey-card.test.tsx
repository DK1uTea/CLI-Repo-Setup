import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import SurveyCard from '@/features/reporting-tool/trade-fair-event-form/(components)/steps/trade-fair-event-form-step-survey/survey-card';
import type { TradeFairEventFormDto } from '@/features/reporting-tool/trade-fair-event-form/(helpers)/trade-fair-event-form-schema';

const { surveyState } = vi.hoisted(() => ({
  surveyState: {
    items: [
      { id: 'survey-1', name: 'Survey one', totalQuestions: 1, canEdit: true },
      { id: 'survey-2', name: 'Survey two', totalQuestions: 2, canEdit: true },
    ],
  },
}));

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('nuqs', () => ({ parseAsString: {}, useQueryState: () => ['event-1', vi.fn()] }));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: ReactNode }) => <a href={href}>{children}</a>,
  usePathname: () => '/reporting-tool/update-event',
}));
vi.mock('@/features/reporting-tool/(hooks)/(survey-hooks)/use-get-survey', () => ({
  useGetSurvey: () => ({
    surveys: surveyState.items,
    pagination: { total: 2, totalPages: 1 },
    isLoading: false,
  }),
}));
vi.mock('@/features/reporting-tool/trade-fair-event-form/(components)/steps/trade-fair-event-form-step-survey/survey-item-card', () => ({
  default: ({ survey, checked, onCheckedChange }: { survey: { name: string }; checked: boolean; onCheckedChange: (checked: boolean) => void }) => (
    <button type="button" aria-pressed={checked} onClick={() => onCheckedChange(!checked)}>
      {survey.name}
    </button>
  ),
}));
vi.mock('@/features/reporting-tool/survey-builder/(components)/survey-library-pagination', () => ({
  default: () => null,
}));

function Harness() {
  const methods = useForm<TradeFairEventFormDto>({
    defaultValues: { surveys: [] },
  });

  return (
    <FormProvider {...methods}>
      <SurveyCard />
    </FormProvider>
  );
}

describe('Trade Fair event survey selection', () => {
  beforeEach(() => {
    surveyState.items = [
      { id: 'survey-1', name: 'Survey one', totalQuestions: 1, canEdit: true },
      { id: 'survey-2', name: 'Survey two', totalQuestions: 2, canEdit: true },
    ];
  });

  it('shows an empty state while keeping Create new survey available', () => {
    surveyState.items = [];
    render(<Harness />);

    expect(screen.getByText('noSurveys')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /createNewSurvey/i })).toBeInTheDocument();
  });

  it('keeps multiple surveys selected independently', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Survey one' }));
    await user.click(screen.getByRole('button', { name: 'Survey two' }));

    expect(screen.getByRole('button', { name: 'Survey one' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Survey two' })).toHaveAttribute('aria-pressed', 'true');
  });
});
