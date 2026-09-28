import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { describe, expect, it, vi } from 'vitest'

import { EventCalendarToolbar } from '@/features/events/event-calendar/(components)/event-calendar-toolbar'
import { apiProxy } from '@/lib/api'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('@/lib/api', () => ({ apiProxy: { get: vi.fn() } }))

function renderToolbar() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <NuqsTestingAdapter hasMemory>
        <EventCalendarToolbar
          viewKey="month"
          onChangeViewAction={vi.fn()}
          onApplyDateRangeAction={vi.fn()}
          onResetDateRangeAction={vi.fn()}
        />
      </NuqsTestingAdapter>
    </QueryClientProvider>,
  )
}

describe('EventCalendarToolbar — Export to Excel', () => {
  // testcase/event-navigator/event-calendar.md cases 56-63: Export to Excel on the
  // Calendar tab must open the same scope/year picker the Event List tab already has
  // (EventListExportFilter + useExportEventToExcel — see event-list-export-filter.tsx).

  it('opens a scope/year export popup when Export to Excel is clicked, same as the List tab', async () => {
    const user = userEvent.setup()
    renderToolbar()

    await user.click(screen.getByRole('button', { name: /exportToExcel/ }))

    expect(await screen.findByRole('radio', { name: /exportAll/ })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /exportPast/ })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /exportFuture/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'export' })).toBeInTheDocument()
  })

  it('calls the export API with the selected scope and year when Export is confirmed', async () => {
    vi.mocked(apiProxy.get).mockResolvedValue({ status: 200, data: new Blob(), headers: {} })
    const user = userEvent.setup()
    renderToolbar()

    await user.click(screen.getByRole('button', { name: /exportToExcel/ }))
    await user.click(await screen.findByRole('radio', { name: /exportPast/ }))
    await user.click(screen.getByRole('button', { name: 'export' }))

    expect(apiProxy.get).toHaveBeenCalledWith(
      '/etr/events/export',
      expect.objectContaining({
        params: expect.objectContaining({ yearScope: 'PAST' }),
      }),
    )
  })
})
