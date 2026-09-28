import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { describe, expect, it, vi } from 'vitest'

import { EventListDateFilter } from '@/features/events/event-list/(components)/event-list-date-filter'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('@/shared/components/ui/date-range-picker', () => ({
  DateRangePicker: ({
    trigger, onApplyAction, onResetAction,
  }: {
    trigger: React.ReactElement
    onApplyAction: (range: { from?: Date; to?: Date }) => void
    onResetAction: () => void
  }) => (
    <div>
      {trigger}
      <button type="button" onClick={() => onApplyAction({ from: new Date('2026-08-01T00:00:00Z'), to: new Date('2026-08-05T00:00:00Z') })}>
        apply-range
      </button>
      <button type="button" onClick={onResetAction}>reset-range</button>
    </div>
  ),
}))

describe('EventListDateFilter', () => {
  it('applies the selected date range to the start_date/end_date URL params', async () => {
    const user = userEvent.setup()
    const onUrlUpdate = vi.fn()

    render(
      <NuqsTestingAdapter onUrlUpdate={onUrlUpdate} hasMemory>
        <EventListDateFilter />
      </NuqsTestingAdapter>,
    )

    await user.click(screen.getByRole('button', { name: 'apply-range' }))

    await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled())
    const searchParams = onUrlUpdate.mock.lastCall?.[0].searchParams
    expect(searchParams?.get('start_date')).toBe(new Date('2026-08-01T00:00:00Z').toISOString())
    expect(searchParams?.get('end_date')).toBe(new Date('2026-08-05T00:00:00Z').toISOString())
  })

  it('clears both start_date and end_date URL params on Reset', async () => {
    const user = userEvent.setup()
    const onUrlUpdate = vi.fn()

    render(
      <NuqsTestingAdapter
        searchParams="?start_date=2026-08-01T00%3A00%3A00.000Z&end_date=2026-08-05T00%3A00%3A00.000Z"
        onUrlUpdate={onUrlUpdate}
        hasMemory
      >
        <EventListDateFilter />
      </NuqsTestingAdapter>,
    )

    await user.click(screen.getByRole('button', { name: 'reset-range' }))

    await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled())
    const searchParams = onUrlUpdate.mock.lastCall?.[0].searchParams
    expect(searchParams?.has('start_date')).toBe(false)
    expect(searchParams?.has('end_date')).toBe(false)
  })

  it('marks the trigger as active only when both start_date and end_date are set', () => {
    const { rerender } = render(
      <NuqsTestingAdapter searchParams="?start_date=2026-08-01T00%3A00%3A00.000Z" hasMemory>
        <EventListDateFilter />
      </NuqsTestingAdapter>,
    )
    expect(screen.getByRole('button', { name: /filterDate/ }).className).not.toMatch(/border-primary/)

    rerender(
      <NuqsTestingAdapter
        searchParams="?start_date=2026-08-01T00%3A00%3A00.000Z&end_date=2026-08-05T00%3A00%3A00.000Z"
        hasMemory
      >
        <EventListDateFilter />
      </NuqsTestingAdapter>,
    )
    expect(screen.getByRole('button', { name: /filterDate/ }).className).toMatch(/border-primary/)
  })
})
