import { act, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FormProvider, useForm } from 'react-hook-form'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { apiProxy } from '@/lib/api'
import { useSubmitCalendarEvent } from '@/features/calendar/calendar-event-form/(hooks)/use-submit-calendar-event'
import type { CalendarEventFormDto } from '@/features/calendar/calendar-event-form/(helpers)/calendar-event-form-schema'

const { uploadFilesMock, eventIdState, routerPushMock } = vi.hoisted(() => ({
  uploadFilesMock: vi.fn(),
  eventIdState: { value: 'event-1' as string | null },
  routerPushMock: vi.fn(),
}))

vi.mock('nuqs', () => ({ parseAsString: {}, useQueryState: () => [eventIdState.value] }))
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }))
vi.mock('@/i18n/navigation', () => ({ useRouter: () => ({ push: routerPushMock }) }))
vi.mock('@/lib/api', () => ({
  apiProxy: {
    post: vi.fn().mockResolvedValue({ data: {} }),
    patch: vi.fn().mockResolvedValue({ data: {} }),
  },
}))
vi.mock('@/features/events/event-form/(hooks)/use-upload-event-files', () => ({
  useUploadEventFiles: () => ({ uploadFiles: uploadFilesMock, isUploading: false }),
}))

function Wrapper({ children }: { children: React.ReactNode }) {
  const pendingImage = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
  const methods = useForm<CalendarEventFormDto>({
    defaultValues: {
      customEventId: 'calendar-event', title: 'Calendar event', mode: 'FACE_TO_FACE', targetAudience: ['CONSUMER'],
      eventTypeId: 'type-1', doNotPublish: false, shortDescription: 'Description',
      images: [{ name: 'photo.jpg', preview: '', file: pendingImage, isUploaded: false }],
      startDate: '2026-08-12', startTime: '10:00', endDate: '2026-08-12', endTime: '12:00',
      address: 'Venue', street: 'Street 1', zipCode: '80331', city: 'Munich', isSaveAddress: false,
      contactFirstName: 'Max', contactLastName: 'Mustermann', contactEmail: 'max@example.com',
      contactPhone: '+49123456', contacts: [], partnershipTypes: [], productPartnerCategories: [],
    } as CalendarEventFormDto,
  })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={queryClient}>
      <FormProvider {...methods}>{children}</FormProvider>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  eventIdState.value = 'event-1'
  uploadFilesMock.mockReset()
  routerPushMock.mockReset()
  vi.mocked(apiProxy.post).mockClear()
  vi.mocked(apiProxy.patch).mockClear()
})

describe('useSubmitCalendarEvent images', () => {
  it('uploads pending images and sends the API a string array', async () => {
    uploadFilesMock.mockResolvedValueOnce([
      { filename: 'photo.jpg', url: 'https://cdn/photo.jpg', key: 'event/photo.jpg' },
    ])
    const { result } = renderHook(() => useSubmitCalendarEvent(), { wrapper: Wrapper })

    await act(async () => result.current.submit())

    expect(uploadFilesMock).toHaveBeenCalledWith(expect.any(Array), 'event')
    expect(apiProxy.patch).toHaveBeenCalledWith(
      'etr/calendar/event-1',
      expect.objectContaining({ images: ['event/photo.jpg'] }),
    )
  })

  it('sends uploaded image keys as a string array when creating', async () => {
    eventIdState.value = null
    uploadFilesMock.mockResolvedValueOnce([
      { filename: 'photo.jpg', url: 'https://cdn/photo.jpg', key: 'event/photo.jpg' },
    ])
    const { result } = renderHook(() => useSubmitCalendarEvent(), { wrapper: Wrapper })

    await act(async () => result.current.submit())

    expect(apiProxy.post).toHaveBeenCalledWith(
      'etr/calendar',
      expect.objectContaining({ images: ['event/photo.jpg'] }),
    )
  })

  it('lets the navigation guard leave after saving without forcing a dashboard redirect', async () => {
    uploadFilesMock.mockResolvedValueOnce([
      { filename: 'photo.jpg', url: 'https://cdn/photo.jpg', key: 'event/photo.jpg' },
    ])
    const { result } = renderHook(
      () => useSubmitCalendarEvent({ redirectAfterSubmit: false }),
      { wrapper: Wrapper },
    )

    let didSubmit = false
    await act(async () => {
      didSubmit = await result.current.submit()
    })

    expect(didSubmit).toBe(true)
    expect(apiProxy.patch).toHaveBeenCalledWith('etr/calendar/event-1', expect.any(Object))
    expect(routerPushMock).not.toHaveBeenCalled()
  })

  it('returns false instead of rejecting when the Calendar API fails', async () => {
    uploadFilesMock.mockResolvedValueOnce([])
    vi.mocked(apiProxy.patch).mockRejectedValueOnce(new Error('Calendar API failed'))
    const { result } = renderHook(() => useSubmitCalendarEvent(), { wrapper: Wrapper })

    let didSubmit = true
    await act(async () => {
      didSubmit = await result.current.submit()
    })

    expect(didSubmit).toBe(false)
    expect(routerPushMock).not.toHaveBeenCalled()
  })
})
