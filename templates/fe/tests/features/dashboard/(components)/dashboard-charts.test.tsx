import { render, screen } from '@testing-library/react'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import DashboardCharts from '@/features/dashboard/(components)/dashboard-charts'

const mocks = vi.hoisted(() => ({
  analytics: {
    data: undefined as { months: Array<{ label: string; total: number }>; totalTurnover: number } | undefined,
    isLoading: true,
  },
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('@/features/dashboard/(hooks)/use-event-analytics-turnover', () => ({
  useEventAnalyticsTurnover: () => mocks.analytics,
}))

vi.mock('@/features/dashboard/(components)/dashboard-bar-chart', () => ({
  DashboardBarChart: () => <div>Bar chart</div>,
}))

vi.mock('@/features/dashboard/(components)/dashboard-donut-chart', () => ({
  DashboardDonutChart: ({ isLoading }: { isLoading?: boolean }) => (
    <div>
      {isLoading ? <div data-slot="skeleton" /> : <div>Donut chart</div>}
      <label>
        <input type="checkbox" />
        includeFutureEvents
      </label>
    </div>
  ),
}))

describe('DashboardCharts', () => {
  beforeEach(() => {
    mocks.analytics.data = undefined
    mocks.analytics.isLoading = true
  })

  it('shows a skeleton in each chart card while turnover is loading', () => {
    const { container } = render(
      <NuqsTestingAdapter>
        <DashboardCharts />
      </NuqsTestingAdapter>,
    )

    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(2)
    expect(screen.queryByText('Bar chart')).not.toBeInTheDocument()
    expect(screen.queryByText('Donut chart')).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'includeFutureEvents' })).toBeInTheDocument()
  })

  it('shows both charts after turnover finishes loading', () => {
    mocks.analytics.data = { months: [], totalTurnover: 0 }
    mocks.analytics.isLoading = false

    const { container } = render(
      <NuqsTestingAdapter>
        <DashboardCharts />
      </NuqsTestingAdapter>,
    )

    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeInTheDocument()
    expect(screen.getByText('Bar chart')).toBeInTheDocument()
    expect(screen.getByText('Donut chart')).toBeInTheDocument()
  })
})
