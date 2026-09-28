import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { EventListSelectFilter } from '@/features/events/event-list/(components)/event-list-select-filter'

const OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'CONGRESS', label: 'Congress' },
  { value: 'FAIR', label: 'Fair' },
]

describe('EventListSelectFilter', () => {
  it('opens the dropdown and lists every option', async () => {
    const user = userEvent.setup()
    render(<EventListSelectFilter label="Category" value="all" options={OPTIONS} onChange={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /All/ }))

    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Congress' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fair' })).toBeInTheDocument()
  })

  it('calls onChange with the newly selected value, replacing the previous one (single-select)', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<EventListSelectFilter label="Category" value="all" options={OPTIONS} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: /All/ }))
    await user.click(screen.getByRole('button', { name: 'Congress' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('CONGRESS')
  })

  it('closes the dropdown after selecting an option', async () => {
    const user = userEvent.setup()
    render(<EventListSelectFilter label="Category" value="all" options={OPTIONS} onChange={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /All/ }))
    await user.click(screen.getByRole('button', { name: 'Congress' }))

    expect(screen.queryByRole('button', { name: 'Fair' })).not.toBeInTheDocument()
  })

  it('shows the selected option label on the trigger', () => {
    render(<EventListSelectFilter label="Category" value="CONGRESS" options={OPTIONS} onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Congress' })).toBeInTheDocument()
  })

  it('falls back to the label when the value matches no option', () => {
    render(<EventListSelectFilter label="Category" value="UNKNOWN" options={OPTIONS} onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Category' })).toBeInTheDocument()
  })

  it('is not marked active for the default "all" value unless isActive is forced', () => {
    render(<EventListSelectFilter label="Category" value="all" options={OPTIONS} onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: /All/ }).className).not.toMatch(/border-primary/)
  })

  it('is marked active for a non-"all" value', () => {
    render(<EventListSelectFilter label="Category" value="CONGRESS" options={OPTIONS} onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Congress' }).className).toMatch(/border-primary/)
  })

  it('honours an explicit isActive override even for the "all" value (Status filter is always shown active)', () => {
    render(<EventListSelectFilter label="Status" value="all" options={OPTIONS} onChange={vi.fn()} isActive />)

    expect(screen.getByRole('button', { name: /All/ }).className).toMatch(/border-primary/)
  })

  it('renders a custom triggerLabel instead of the resolved option label (Per Page: "20 Per Page")', () => {
    render(
      <EventListSelectFilter
        label="Show"
        value="20"
        options={[{ value: '20', label: '20' }]}
        onChange={vi.fn()}
        triggerLabel="20 Per Page"
      />,
    )

    expect(screen.getByRole('button', { name: '20 Per Page' })).toBeInTheDocument()
  })
})
