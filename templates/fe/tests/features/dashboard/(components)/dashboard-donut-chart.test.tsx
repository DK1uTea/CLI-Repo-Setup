import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import { describe, expect, it, vi } from 'vitest'

import { DashboardDonutChart } from '@/features/dashboard/(components)/dashboard-donut-chart'
import deMessages from '@/messages/de.json'

/**
 * Test-case source: Dashboard test case sheet — "Metrics - Sales Figure" section
 * (#45-51): checkbox default state and toggling reports back up correctly, and the
 * pie chart container itself renders without error in both the loading and loaded
 * state. Recharts' `ResponsiveContainer` measures a 0x0 box under jsdom (no real
 * layout engine), so the SVG's pie label/legend text never actually renders here —
 * asserting the EUR-formatted value and "Sales Figure" legend text requires a real
 * browser and belongs in e2e/modules/dashboards/content.spec.ts instead.
 */

function renderDonut(props: Partial<React.ComponentProps<typeof DashboardDonutChart>> = {}) {
  const onIncludeFutureChange = vi.fn()
  const utils = render(
    <NextIntlClientProvider locale="de" messages={deMessages}>
      <DashboardDonutChart
        totalTurnover={1234}
        includeFuture={false}
        onIncludeFutureChange={onIncludeFutureChange}
        {...props}
      />
    </NextIntlClientProvider>,
  )
  return { ...utils, onIncludeFutureChange }
}

describe('DashboardDonutChart', () => {
  it('shows a skeleton instead of the chart while loading', () => {
    const { container } = renderDonut({ isLoading: true })

    expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="chart"]')).not.toBeInTheDocument()
  })

  it('renders the pie chart container once loading finishes, with no errors', () => {
    const { container } = renderDonut({ isLoading: false, totalTurnover: 1234 })

    expect(container.querySelector('[data-slot="chart"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeInTheDocument()
  })

  it('renders with no errors when there is no turnover data', () => {
    const { container } = renderDonut({ totalTurnover: 0 })

    expect(container.querySelector('[data-slot="chart"]')).toBeInTheDocument()
  })

  it('defaults the Include Future Events checkbox to unchecked', () => {
    renderDonut({ includeFuture: false })

    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('shows the checkbox as checked when includeFuture is true', () => {
    renderDonut({ includeFuture: true })

    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('reports true when the unchecked checkbox is clicked', async () => {
    const user = userEvent.setup()
    const { onIncludeFutureChange } = renderDonut({ includeFuture: false })

    await user.click(screen.getByRole('checkbox'))

    expect(onIncludeFutureChange).toHaveBeenCalledWith(true)
  })

  it('reports null when the checked checkbox is unchecked', async () => {
    const user = userEvent.setup()
    const { onIncludeFutureChange } = renderDonut({ includeFuture: true })

    await user.click(screen.getByRole('checkbox'))

    expect(onIncludeFutureChange).toHaveBeenCalledWith(null)
  })
})
