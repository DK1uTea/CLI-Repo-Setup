import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useExportEventToExcel } from '@/features/events/event-list/(hooks)/use-export-event-to-excel'
import { apiProxy } from '@/lib/api'

vi.mock('@/lib/api', () => ({ apiProxy: { get: vi.fn() } }))
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
vi.mock('@/shared/stores/use-user-store', () => ({ useDateFormat: () => 'YYYY/MM/DD' }))
vi.mock('@/features/events/event-list/(hooks)/use-event-list-filters', () => ({
  useEventListFilters: () => ({
    filters: { timeFrame: 'all' },
  }),
}))

describe('useExportEventToExcel', () => {
  it('omits timeFrame when All is selected, matching the event list request', async () => {
    vi.mocked(apiProxy.get).mockResolvedValue({ status: 204 })
    const { result } = renderHook(() => useExportEventToExcel())

    await act(async () => {
      await result.current.exportEvents()
    })

    expect(apiProxy.get).toHaveBeenCalledWith('/etr/events/export', {
      params: {
        sort: 'createdAt:desc',
        onlyMine: false,
      },
      paramsSerializer: { indexes: null },
      responseType: 'blob',
    })
  })
})
