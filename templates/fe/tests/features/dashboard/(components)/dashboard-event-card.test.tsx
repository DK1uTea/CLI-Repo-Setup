import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DashboardEventCard } from '@/features/dashboard/(components)/dashboard-event-card'
import deMessages from '@/messages/de.json'
import enMessages from '@/messages/en.json'

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, ...props }: React.ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...props} />
  ),
}))

const baseEvent = {
  id: 'event-1',
  name: 'Annual event',
  startDate: '2026-09-05T09:00:00.000Z',
}

function renderCard(
  startDate = baseEvent.startDate,
  locale: 'de' | 'en' = 'en',
  showStartingSoon = true,
) {
  return render(
    <NextIntlClientProvider
      locale={locale}
      messages={locale === 'de' ? deMessages : enMessages}
    >
      <DashboardEventCard
        event={{ ...baseEvent, startDate }}
        showStartingSoon={showStartingSoon}
      />
    </NextIntlClientProvider>,
  )
}

describe('DashboardEventCard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-28T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the corresponding days remaining when the event starts in less than 10 days', () => {
    renderCard()

    expect(screen.getByText('Deadline in 8 Days')).toBeInTheDocument()
  })

  it('shows the reminder when the event starts in exactly 10 days', () => {
    renderCard('2026-09-07T09:00:00.000Z')

    expect(screen.getByText('Deadline in 10 Days')).toBeInTheDocument()
  })

  it('hides the reminder when starting-soon display is disabled', () => {
    renderCard(baseEvent.startDate, 'en', false)

    expect(screen.queryByText('Deadline in 8 Days')).not.toBeInTheDocument()
  })

  it.each([
    ['en', 'Deadline in 1 Day'],
    ['de', 'Fällig in 1 Tag'],
  ] as const)('uses the singular day label in the %s locale', (locale, expectedText) => {
    renderCard('2026-08-29T09:00:00.000Z', locale)

    expect(screen.getByText(expectedText)).toBeInTheDocument()
  })

  it('uses the German plural day label', () => {
    renderCard(baseEvent.startDate, 'de')

    expect(screen.getByText('Fällig in 8 Tagen')).toBeInTheDocument()
  })

  // Test-case source: Dashboard test case sheet, "Logic 'Deadline in {n} Day(s)'".
  it('does not show the reminder once the event is 11 or more days out', () => {
    renderCard('2026-09-08T09:00:00.000Z') // 2026-08-28 + 11 days

    expect(screen.queryByText(/Deadline in \d+ Days?/)).not.toBeInTheDocument()
  })

  it.each([
    ['en', 'Today'],
    ['de', 'Heute'],
  ] as const)("shows 'Today' instead of 'Deadline in 0 Days' when the event starts today (%s)", (locale, expectedText) => {
    renderCard('2026-08-28T09:00:00.000Z', locale)

    expect(screen.getByText(expectedText)).toBeInTheDocument()
    expect(screen.queryByText(/Deadline in 0 Days?|Fällig in 0 Tag/)).not.toBeInTheDocument()
  })
})
