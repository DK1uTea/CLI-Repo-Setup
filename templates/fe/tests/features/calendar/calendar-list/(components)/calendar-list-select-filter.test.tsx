import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { CalendarListSelectFilter } from '@/features/calendar/calendar-list/(components)/calendar-list-select-filter'

/**
 * Sheet #12/#13/#14 — the Event-Typ (Event Type / "category") filter is one
 * instance of this shared select-filter component (see
 * `calendar-list-main.tsx`: `label={t('filterEventType')}`). Covered here at
 * the component level since the option list, single-select behavior and
 * "narrows to just that value" wiring are all generic to this component,
 * not specific to the eventType prop wiring.
 */
const options = [
  { value: 'all', label: 'All' },
  { value: 'AWARD', label: 'Award' },
  { value: 'CONGRESS', label: 'Congress' },
  { value: 'CUSTOMER', label: 'Customer' },
]

describe('CalendarListSelectFilter (Event-Typ / category dropdown)', () => {
  it('opens to show the full option list', async () => {
    const user = userEvent.setup()
    render(
      <CalendarListSelectFilter label="Filter" value={null} options={options} onChange={vi.fn()} />,
    )

    await user.click(screen.getByRole('button', { name: 'Filter' }))

    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Award' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Congress' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Customer' })).toBeInTheDocument()
  })

  it('picking one category reports only that single value to the caller', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <CalendarListSelectFilter label="Filter" value={null} options={options} onChange={onChange} />,
    )

    await user.click(screen.getByRole('button', { name: 'Filter' }))
    await user.click(screen.getByRole('button', { name: 'Award' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('AWARD')
  })

  it('is single-select — picking a category closes the menu instead of allowing a second pick', async () => {
    const user = userEvent.setup()
    render(
      <CalendarListSelectFilter label="Filter" value={null} options={options} onChange={vi.fn()} />,
    )

    await user.click(screen.getByRole('button', { name: 'Filter' }))
    await user.click(screen.getByRole('button', { name: 'Award' }))

    expect(screen.queryByRole('button', { name: 'Congress' })).not.toBeInTheDocument()
  })

  it('shows the currently selected option as the trigger label, not the static filter name', () => {
    render(
      <CalendarListSelectFilter label="Filter" value="AWARD" options={options} onChange={vi.fn()} />,
    )

    expect(screen.getByRole('button', { name: 'Award' })).toBeInTheDocument()
  })
})
