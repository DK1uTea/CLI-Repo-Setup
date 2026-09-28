import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import SurveyAssignTeamCard from '@/features/reporting-tool/trade-fair-event-form/(components)/steps/trade-fair-event-form-step-review-launch/survey-assign-team-card'
import type { EventSurvey } from '@/features/reporting-tool/(helpers)/trade-fair-event-type'
import deMessages from '@/messages/de.json'
import enMessages from '@/messages/en.json'

const mocks = vi.hoisted(() => ({
  usersPagination: { total: 0, totalPages: 1 },
}))

vi.mock('@/features/reporting-tool/(hooks)/(survey-hooks)/use-get-user-event-survey', () => ({
  useGetUserEventSurvey: () => ({
    users: [],
    usersPagination: mocks.usersPagination,
    isLoading: false,
  }),
}))

vi.mock('@/features/reporting-tool/trade-fair-event-form/(hooks)/use-trade-fair-event-action', () => ({
  useTradeFairEventActions: () => ({ goToStep: vi.fn() }),
}))

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/reporting-tool',
}))

const eventSurvey: EventSurvey = {
  id: 'survey-1',
  eventSurveyId: 'event-survey-1',
  name: 'Customer feedback',
  description: 'Legacy survey description',
  totalQuestions: 12,
  assignmentCount: 0,
  assignments: [],
  requiredLogin: true,
  canEdit: true,
}

describe('SurveyAssignTeamCard', () => {
  beforeEach(() => {
    mocks.usersPagination = { total: 0, totalPages: 1 }
  })

  it('shows the translated survey question count in English', () => {
    render(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <NuqsTestingAdapter>
          <SurveyAssignTeamCard eventSurvey={eventSurvey} />
        </NuqsTestingAdapter>
      </NextIntlClientProvider>,
    )

    expect(screen.getByText('12 questions')).toBeVisible()
    expect(screen.queryByText('Legacy survey description')).not.toBeInTheDocument()
    expect(screen.queryByText('Public survey')).not.toBeInTheDocument()
    expect(screen.getByRole('table')).toBeVisible()
    expect(screen.getByText('No team members selected')).toBeVisible()
  })

  it('shows the public message instead of the team table when login is not required', () => {
    mocks.usersPagination = { total: 10, totalPages: 2 }

    render(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <NuqsTestingAdapter>
          <SurveyAssignTeamCard eventSurvey={{ ...eventSurvey, requiredLogin: false }} />
        </NuqsTestingAdapter>
      </NextIntlClientProvider>,
    )

    expect(screen.getByText('Public survey')).toBeVisible()
    expect(
      screen.getByText('This survey is public — anyone with the link can take it without signing in.'),
    ).toBeVisible()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(1)
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('shows the translated survey question count in German', () => {
    render(
      <NextIntlClientProvider locale="de" messages={deMessages}>
        <NuqsTestingAdapter>
          <SurveyAssignTeamCard eventSurvey={eventSurvey} />
        </NuqsTestingAdapter>
      </NextIntlClientProvider>,
    )

    expect(screen.getByText('12 Fragen')).toBeVisible()
    expect(screen.getByText('Keine Teammitglieder ausgewählt')).toBeVisible()
  })

  it('shows the public message in German', () => {
    render(
      <NextIntlClientProvider locale="de" messages={deMessages}>
        <NuqsTestingAdapter>
          <SurveyAssignTeamCard eventSurvey={{ ...eventSurvey, requiredLogin: false }} />
        </NuqsTestingAdapter>
      </NextIntlClientProvider>,
    )

    expect(
      screen.getByText('Diese Umfrage ist öffentlich — jeder mit dem Link kann sie ohne Anmeldung ausfüllen.'),
    ).toBeVisible()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})
