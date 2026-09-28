import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { describe, expect, it, vi } from 'vitest'

import { CalendarListPartnershipFilter } from '@/features/calendar/calendar-list/(components)/calendar-list-partnership-filter'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))
vi.mock('@/features/events/event-list/(hooks)/use-event-filter-config', () => ({
  useEventFilterConfig: () => ({
    data: {
      partnershipTypes: [
        {
          value: 'PRODUCT_PARTNER',
          label: 'Product Partner',
          categories: [{ value: 'SOFTDRINKS', label: 'Softdrinks' }],
        },
      ],
    },
  }),
}))

describe('CalendarListPartnershipFilter', () => {
  it('stores Product Partner categories separately from partnership types', async () => {
    const user = userEvent.setup()
    const onUrlUpdate = vi.fn()

    render(
      <NuqsTestingAdapter onUrlUpdate={onUrlUpdate} hasMemory>
        <CalendarListPartnershipFilter
          partnerships={[
            {
              value: 'PRODUCT_PARTNER',
              label: 'Product Partner',
              categories: [{ value: 'SOFTDRINKS', label: 'Softdrinks' }],
            },
          ]}
        />
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

  // Sheet #19: ticking the parent ("Product Partner") should only reveal its
  // child category list, not pre-check any of them.
  it('ticking the parent partnership type reveals its child categories without auto-ticking them', async () => {
    const user = userEvent.setup()
    const onUrlUpdate = vi.fn()

    render(
      <NuqsTestingAdapter onUrlUpdate={onUrlUpdate} hasMemory>
        <CalendarListPartnershipFilter
          partnerships={[
            {
              value: 'PRODUCT_PARTNER',
              label: 'Product Partner',
              categories: [{ value: 'SOFTDRINKS', label: 'Softdrinks' }],
            },
          ]}
        />
      </NuqsTestingAdapter>,
    )

    await user.click(screen.getByRole('button', { name: 'filterPartnership' }))
    expect(screen.queryByRole('checkbox', { name: 'Softdrinks' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: 'Product Partner' }))

    const childCheckbox = screen.getByRole('checkbox', { name: 'Softdrinks' })
    expect(childCheckbox).toBeInTheDocument()
    expect(childCheckbox).not.toBeChecked()

    await user.click(screen.getByRole('button', { name: 'apply' }))

    await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled())
    const searchParams = onUrlUpdate.mock.lastCall?.[0].searchParams
    expect(searchParams?.get('partnershipTypes')).toBe('PRODUCT_PARTNER')
    expect(searchParams?.get('productPartnerCategories')).toBeNull()
  })

  // Sheet #20: selecting multiple partnership items should apply all of them
  // together (the backend then ANDs across them) — the FE's job is to send
  // every ticked value, not to pick just one.
  it('applies every ticked partnership type together, not just the last one', async () => {
    const user = userEvent.setup()
    const onUrlUpdate = vi.fn()

    render(
      <NuqsTestingAdapter onUrlUpdate={onUrlUpdate} hasMemory>
        <CalendarListPartnershipFilter
          partnerships={[
            { value: 'PRODUCT_PARTNER', label: 'Product Partner', categories: [] },
            { value: 'EXHIBITION', label: 'Exhibition', categories: [] },
          ]}
        />
      </NuqsTestingAdapter>,
    )

    await user.click(screen.getByRole('button', { name: 'filterPartnership' }))
    await user.click(screen.getByRole('checkbox', { name: 'Product Partner' }))
    await user.click(screen.getByRole('checkbox', { name: 'Exhibition' }))
    await user.click(screen.getByRole('button', { name: 'apply' }))

    await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled())
    const searchParams = onUrlUpdate.mock.lastCall?.[0].searchParams
    expect(searchParams?.get('partnershipTypes')).toBe('PRODUCT_PARTNER,EXHIBITION')
  })
})
