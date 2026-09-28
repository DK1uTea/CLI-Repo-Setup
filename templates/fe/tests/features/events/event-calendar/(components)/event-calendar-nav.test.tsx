import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { EventCalendarNav } from '@/features/events/event-calendar/(components)/event-calendar-nav'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

describe('EventCalendarNav', () => {
  it('shows the Today button, prev/next arrows, and the current period label', () => {
    render(<EventCalendarNav title="September 2026" onPrevAction={vi.fn()} onNextAction={vi.fn()} onTodayAction={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'today' })).toBeInTheDocument()
    expect(screen.getByText('September 2026')).toBeInTheDocument()
  })

  it('calls onTodayAction when Today is clicked', async () => {
    const user = userEvent.setup()
    const onTodayAction = vi.fn()
    render(<EventCalendarNav title="September 2026" onPrevAction={vi.fn()} onNextAction={vi.fn()} onTodayAction={onTodayAction} />)

    await user.click(screen.getByRole('button', { name: 'today' }))

    expect(onTodayAction).toHaveBeenCalledTimes(1)
  })

  it('calls onPrevAction and onNextAction for the arrow buttons', async () => {
    const user = userEvent.setup()
    const onPrevAction = vi.fn()
    const onNextAction = vi.fn()
    render(<EventCalendarNav title="September 2026" onPrevAction={onPrevAction} onNextAction={onNextAction} onTodayAction={vi.fn()} />)

    const arrowButtons = screen.getAllByRole('button').filter((btn) => btn.textContent === '')
    expect(arrowButtons).toHaveLength(2)

    await user.click(arrowButtons[0])
    expect(onPrevAction).toHaveBeenCalledTimes(1)

    await user.click(arrowButtons[1])
    expect(onNextAction).toHaveBeenCalledTimes(1)
  })
})
