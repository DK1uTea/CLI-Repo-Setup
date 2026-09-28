import { describe, expect, it } from 'vitest'

import {
  calendarListUrlToSaved,
  eventListUrlToSaved,
  normalizeSavedFilters,
  savedToCalendarListUrl,
  savedToEventListUrl,
} from '@/features/events/event-list/(helpers)/user-filter-preferences'

describe('user filter preference mappings', () => {
  it('normalizes a GET envelope and treats non-array values as empty arrays', () => {
    expect(normalizeSavedFilters({
      timeFrame: 'NEXT_3_MONTHS',
      partnershipTypes: {},
    })).toEqual({
      timeFrame: 'NEXT_3_MONTHS',
      partnershipTypes: [],
    })
  })

  it('maps event-list URL filters to the saved payload and back', () => {
    const saved = eventListUrlToSaved({
      event_type: 'type-1',
      my_event: 'false',
      partnershipTypes: 'PARTNER,EXHIBITION',
    })

    expect(saved).toEqual({
      onlyMine: false,
      eventTypeId: 'type-1',
      partnershipTypes: ['PARTNER', 'EXHIBITION'],
    })
    expect(savedToEventListUrl(saved)).toMatchObject({
      event_type: 'type-1',
      my_event: 'false',
      partnershipTypes: 'PARTNER,EXHIBITION',
    })
  })

  it('maps calendar filters without turning missing arrays into objects', () => {
    const saved = calendarListUrlToSaved({ onlyMine: true, targetAudience: {} as string[] })

    expect(saved.targetAudience).toEqual([])
    expect(savedToCalendarListUrl(saved).onlyMine).toBe(true)
  })
})
