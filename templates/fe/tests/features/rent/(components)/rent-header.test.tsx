import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import RentHeader from '@/features/rent/(components)/rent-header'

const mocks = vi.hoisted(() => ({
  dateRangePickerProps: undefined as Record<string, unknown> | undefined,
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('nuqs', () => ({
  parseAsString: {},
  useQueryState: () => ['catalogue', vi.fn()],
  useQueryStates: () => [{ start_date: null, end_date: null }, vi.fn()],
}))

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }))

vi.mock('@/shared/components/ui/date-range-picker', () => ({
  DateRangePicker: (props: Record<string, unknown>) => {
    mocks.dateRangePickerProps = props
    return <div />
  },
}))

describe('RentHeader', () => {
  it('disables dates before today in the catalogue date-range picker', () => {
    render(<RentHeader />)

    expect(mocks.dateRangePickerProps?.disablePast).toBe(true)
  })
})
