import { describe, expect, it } from 'vitest'

import { mapCalendarEventDetailToForm } from '@/features/calendar/calendar-event-form/(helpers)/map-calendar-event-detail-to-form'
import type { CalendarEventDetail } from '@/features/calendar/event-calendar-detail/(hooks)/use-calendar-event-detail'

describe('mapCalendarEventDetailToForm', () => {
  it('preserves editable Calendar values when hydrating an existing event', () => {
    const form = mapCalendarEventDetailToForm({
      id: 'event-1',
      name: 'Calendar event',
      createdAt: '2026-08-01',
      startTime: '2026-08-10T10:00:00Z',
      endTime: '2026-08-10T12:00:00Z',
      isPrivate: true,
      locationId: 'location-1',
      productPartnerCategories: ['SOFTDRINKS'],
    } as CalendarEventDetail)

    expect(form).toEqual(expect.objectContaining({
      doNotPublish: true,
      isSaveAddress: true,
      productPartnerCategories: ['SOFTDRINKS'],
    }))
  })

  it('maps API image strings to uploaded files for the shared dropzone', () => {
    const form = mapCalendarEventDetailToForm({
      id: 'event-1',
      name: 'Calendar event',
      createdAt: '2026-08-01',
      startTime: '2026-08-10T10:00:00Z',
      endTime: '2026-08-10T12:00:00Z',
      images: ['https://cdn.example.com/event/photo.jpg'],
    } as CalendarEventDetail)

    expect(form.images).toEqual([
      expect.objectContaining({
        name: 'photo.jpg',
        url: 'https://cdn.example.com/event/photo.jpg',
        preview: 'https://cdn.example.com/event/photo.jpg',
        isUploaded: true,
      }),
    ])
  })

  it('falls back to an empty image list for a malformed API value', () => {
    const form = mapCalendarEventDetailToForm({
      id: 'event-1',
      name: 'Calendar event',
      createdAt: '2026-08-01',
      startTime: '2026-08-10T10:00:00Z',
      endTime: '2026-08-10T12:00:00Z',
      images: {} as never,
    } as CalendarEventDetail)

    expect(form.images).toEqual([])
  })
})
