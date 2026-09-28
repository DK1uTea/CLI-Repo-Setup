import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CalendarEventDetailDownloadPdf } from '@/features/calendar/event-calendar-detail/(components)/calendar-event-detail-download-pdf'
import type { CalendarEventDetail } from '@/features/calendar/event-calendar-detail/(hooks)/use-calendar-event-detail'

const { stepDetailEnabledCalls, downloadMock } = vi.hoisted(() => ({
  stepDetailEnabledCalls: [] as boolean[],
  downloadMock: vi.fn(),
}))

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('@/shared/stores/use-user-store', () => ({
  useDateFormat: () => 'DD/MM/YYYY',
  useCurrency: () => ({ symbol: '€' }),
  useHasPermission: () => true,
}))
vi.mock('@/features/events/event-detail/common/(components)/event-common-pdf-content-wrapper', () => ({
  EventCommonPdfContentWrapper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pdf-wrapper">{children}</div>
  ),
}))
vi.mock('@/features/events/event-detail/event/(components)/event-detail-pdf-content', () => ({
  EventDetailPdfContent: () => <div data-testid="event-pdf-content" />,
  getPrintedAt: () => '',
}))
vi.mock('@/features/events/event-detail/common/(hooks)/use-download-pdf', () => ({
  useDownloadPdf: () => ({ contentRef: { current: null }, downloading: false, download: downloadMock }),
}))
vi.mock('@/features/events/event-form/(hooks)/use-event-step-detail', () => ({
  useEventStepDetail: (_id: string, _step: string, options?: { enabled?: boolean }) => {
    const enabled = !!options?.enabled
    stepDetailEnabledCalls.push(enabled)
    return {
      data: enabled
        ? { general: { id: 'event-1' }, overview: { customEventId: 'EVENT-1' } }
        : undefined,
      isFetching: false,
    }
  },
}))

const EVENT = { id: 'event-1', customEventId: 'CALENDAR-1' } as CalendarEventDetail

beforeEach(() => {
  stepDetailEnabledCalls.length = 0
  downloadMock.mockClear()
})

describe('CalendarEventDetailDownloadPdf', () => {
  it('uses the event summary PDF content and only loads it after clicking download', async () => {
    const user = userEvent.setup()
    render(<CalendarEventDetailDownloadPdf event={EVENT} />)

    expect(screen.queryByTestId('event-pdf-content')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /downloadPdf/i }))

    expect(stepDetailEnabledCalls.some((enabled) => enabled)).toBe(true)
    expect(await screen.findByTestId('event-pdf-content')).toBeInTheDocument()
    expect(downloadMock).toHaveBeenCalledWith('EVENT-1.pdf')
  })
})
