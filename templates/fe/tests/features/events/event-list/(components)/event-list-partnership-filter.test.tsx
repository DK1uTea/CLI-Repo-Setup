import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { describe, expect, it, vi } from 'vitest'

import { EventListPartnershipFilter } from '@/features/events/event-list/(components)/event-list-partnership-filter'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

const PARTNERSHIPS = [
  {
    value: 'PRODUCT_PARTNER',
    label: 'Product Partner',
    categories: [{ value: 'SOFTDRINKS', label: 'Softdrinks' }],
  },
  { value: 'EXHIBITION', label: 'Exhibition' },
]

describe('EventListPartnershipFilter', () => {
  it('stores Product Partner categories separately from partnership types', async () => {
    const user = userEvent.setup()
    const onUrlUpdate = vi.fn()

    render(
      <NuqsTestingAdapter onUrlUpdate={onUrlUpdate} hasMemory>
        <EventListPartnershipFilter partnerships={PARTNERSHIPS} />
      </NuqsTestingAdapter>,
    )

    await user.click(screen.getByRole('button', { name: 'filterPartnership' }))
    await user.click(screen.getByRole('checkbox', { name: 'Product Partner' }))
    await user.click(screen.getByRole('checkbox', { name: 'Softdrinks' }))
    await user.click(screen.getByRole('button', { name: 'apply' }))

    await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled())
    const searchParams = onUrlUpdate.mock.lastCall?.[0].searchParams
    expect(searchParams?.get('partnershipTypes')).toBe('PRODUCT_PARTNER')
    expect(searchParams?.get('productPartnerCategories')).toBe('SOFTDRINKS')
  })

  it('checking Product Partner only opens its category list without auto-checking any category', async () => {
    const user = userEvent.setup()

    render(
      <NuqsTestingAdapter hasMemory>
        <EventListPartnershipFilter partnerships={PARTNERSHIPS} />
      </NuqsTestingAdapter>,
    )

    await user.click(screen.getByRole('button', { name: 'filterPartnership' }))
    expect(screen.queryByRole('checkbox', { name: 'Softdrinks' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: 'Product Partner' }))

    expect(screen.getByRole('checkbox', { name: 'Softdrinks' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Softdrinks' })).not.toBeChecked()
  })

  it('unchecking Product Partner hides its category list again', async () => {
    const user = userEvent.setup()

    render(
      <NuqsTestingAdapter hasMemory>
        <EventListPartnershipFilter partnerships={PARTNERSHIPS} />
      </NuqsTestingAdapter>,
    )

    await user.click(screen.getByRole('button', { name: 'filterPartnership' }))
    await user.click(screen.getByRole('checkbox', { name: 'Product Partner' }))
    expect(screen.getByRole('checkbox', { name: 'Softdrinks' })).toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: 'Product Partner' }))

    expect(screen.queryByRole('checkbox', { name: 'Softdrinks' })).not.toBeInTheDocument()
  })

  it('applies multiple checked types together (AND across selections), not just the last one', async () => {
    const user = userEvent.setup()
    const onUrlUpdate = vi.fn()

    render(
      <NuqsTestingAdapter onUrlUpdate={onUrlUpdate} hasMemory>
        <EventListPartnershipFilter partnerships={PARTNERSHIPS} />
      </NuqsTestingAdapter>,
    )

    await user.click(screen.getByRole('button', { name: 'filterPartnership' }))
    await user.click(screen.getByRole('checkbox', { name: 'Product Partner' }))
    await user.click(screen.getByRole('checkbox', { name: 'Softdrinks' }))
    await user.click(screen.getByRole('checkbox', { name: 'Exhibition' }))
    await user.click(screen.getByRole('button', { name: 'apply' }))

    await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled())
    const searchParams = onUrlUpdate.mock.lastCall?.[0].searchParams
    expect(searchParams?.get('partnershipTypes')).toBe('PRODUCT_PARTNER,EXHIBITION')
  })

  it('clears every selection and the applied URL filters when Reset is clicked', async () => {
    const user = userEvent.setup()
    const onUrlUpdate = vi.fn()

    render(
      <NuqsTestingAdapter onUrlUpdate={onUrlUpdate} hasMemory>
        <EventListPartnershipFilter partnerships={PARTNERSHIPS} />
      </NuqsTestingAdapter>,
    )

    await user.click(screen.getByRole('button', { name: 'filterPartnership' }))
    await user.click(screen.getByRole('checkbox', { name: 'Exhibition' }))
    await user.click(screen.getByRole('button', { name: 'apply' }))
    await waitFor(() => expect(onUrlUpdate.mock.lastCall?.[0].searchParams.get('partnershipTypes')).toBe('EXHIBITION'))

    await user.click(screen.getByRole('button', { name: 'filterPartnership' }))
    await user.click(screen.getByRole('button', { name: 'reset' }))

    await waitFor(() => {
      const searchParams = onUrlUpdate.mock.lastCall?.[0].searchParams
      expect(searchParams?.has('partnershipTypes')).toBe(false)
      expect(searchParams?.has('productPartnerCategories')).toBe(false)
    })
  })

  it('marks the trigger as active once a filter is applied', async () => {
    const user = userEvent.setup()

    render(
      <NuqsTestingAdapter hasMemory>
        <EventListPartnershipFilter partnerships={PARTNERSHIPS} />
      </NuqsTestingAdapter>,
    )

    const trigger = screen.getByRole('button', { name: 'filterPartnership' })
    expect(trigger.className).not.toMatch(/border-primary/)

    await user.click(trigger)
    await user.click(screen.getByRole('checkbox', { name: 'Exhibition' }))
    await user.click(screen.getByRole('button', { name: 'apply' }))

    expect(trigger.className).toMatch(/border-primary/)
  })
})
