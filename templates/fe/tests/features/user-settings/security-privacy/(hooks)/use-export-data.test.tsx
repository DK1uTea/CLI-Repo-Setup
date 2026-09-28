import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { apiProxy } from '@/lib/api'
import { useExportData } from '@/features/user-settings/security-privacy/(hooks)/use-export-data'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('@/lib/api', () => ({ apiProxy: { get: vi.fn() } }))

describe('useExportData', () => {
  beforeEach(() => vi.mocked(apiProxy.get).mockReset())

  it('requests the export as a blob and reflects isExporting while the request is in flight', async () => {
    let resolveRequest: (value: { data: Blob }) => void = () => {}
    vi.mocked(apiProxy.get).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve
      }),
    )
    const { result } = renderHook(() => useExportData())

    let exportPromise!: Promise<void>
    act(() => {
      exportPromise = result.current.handleExport()
    })
    expect(result.current.isExporting).toBe(true)

    await act(async () => {
      resolveRequest({ data: new Blob(['zip-bytes'], { type: 'application/zip' }) })
      await exportPromise
    })

    expect(apiProxy.get).toHaveBeenCalledWith('/user/export-personal-data', { responseType: 'blob' })
    expect(result.current.isExporting).toBe(false)
  })

  it('shows an error toast and does not throw when the blob comes back empty', async () => {
    const { toast } = await import('sonner')
    vi.mocked(apiProxy.get).mockResolvedValueOnce({ data: new Blob([], { type: 'application/zip' }) })
    const { result } = renderHook(() => useExportData())

    await act(async () => {
      await result.current.handleExport()
    })

    expect(toast.error).toHaveBeenCalled()
  })

  it('shows an error toast when the request rejects', async () => {
    const { toast } = await import('sonner')
    vi.mocked(apiProxy.get).mockRejectedValueOnce(new Error('network error'))
    const { result } = renderHook(() => useExportData())

    await act(async () => {
      await result.current.handleExport()
    })

    expect(toast.error).toHaveBeenCalled()
    expect(result.current.isExporting).toBe(false)
  })

  it.todo(
    'verifying the downloaded ZIP contains contact.csv/event.csv/invite_user.csv/' +
      'metadata.json/user.csv needs an unzip library (adm-zip/unzipper/jszip) that is not ' +
      'currently a project dependency (checked package.json) — E2E already asserts the ' +
      'download event fires with a .zip suggested filename; opening the archive itself is ' +
      'left pending rather than adding a new dependency from a QA test.',
  )
})
