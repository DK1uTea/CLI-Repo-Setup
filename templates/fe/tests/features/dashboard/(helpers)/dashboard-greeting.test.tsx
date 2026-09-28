import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import deMessages from '@/messages/de.json'
import { WelcomeGreeting } from '@/shared/components/common/welcome-greeting'

function renderGreeting(lastLogin: string | null = null) {
  return render(
    <NextIntlClientProvider locale="de" messages={deMessages}>
      <WelcomeGreeting
        firstName="Test"
        lastName="User"
        lastLogin={lastLogin}
        dateFormat="DD/MM/YYYY"
      />
    </NextIntlClientProvider>,
  )
}

describe('WelcomeGreeting', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it.each([
    ['2026-08-28T05:00:00.000Z', 'Guten Morgen, Test User'],
    ['2026-08-28T10:59:00.000Z', 'Guten Morgen, Test User'],
    ['2026-08-28T11:00:00.000Z', 'Guten Nachmittag, Test User'],
    ['2026-08-28T17:59:00.000Z', 'Guten Nachmittag, Test User'],
    ['2026-08-28T18:00:00.000Z', 'Guten Abend, Test User'],
    ['2026-08-28T21:59:00.000Z', 'Guten Abend, Test User'],
    ['2026-08-28T22:00:00.000Z', 'Gute Nacht, Test User'],
    ['2026-08-28T04:59:00.000Z', 'Gute Nacht, Test User'],
  ])('renders the correct greeting for UTC time %s', (isoTime, expected) => {
    vi.setSystemTime(new Date(isoTime))

    renderGreeting()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(expected)
  })

  it('renders the weekday message and formatted last-login time', () => {
    vi.setSystemTime(new Date('2026-08-28T12:00:00.000Z'))

    renderGreeting('2026-08-28T07:30:00.000Z')

    expect(screen.getByText(/^Schönen Freitag!/)).toBeInTheDocument()
    expect(screen.getByText(/Zuletzt angemeldet 07:30 28\/08\/2026/)).toBeInTheDocument()
  })

  it('uses the current time when lastLogin is not available', () => {
    vi.setSystemTime(new Date('2026-08-28T12:00:00.000Z'))

    renderGreeting()

    expect(screen.getByText(/Zuletzt angemeldet 12:00 28\/08\/2026/)).toBeInTheDocument()
  })
})
