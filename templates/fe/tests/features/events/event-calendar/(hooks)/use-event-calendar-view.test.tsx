import type { ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { describe, expect, it } from 'vitest'

import { FC_VIEW_NAME, useEventCalendarView } from '@/features/events/event-calendar/(hooks)/use-event-calendar-view'

function wrapper({ children }: { children: ReactNode }) {
  return <NuqsTestingAdapter>{children}</NuqsTestingAdapter>
}

describe('useEventCalendarView', () => {
  it('defaults the view to Month', () => {
    const { result } = renderHook(() => useEventCalendarView(), { wrapper })

    expect(result.current.view).toBe('month')
    expect(result.current.initialView).toBe('dayGridMonth')
  })

  it('maps each view key to the correct FullCalendar internal view name', () => {
    expect(FC_VIEW_NAME.month).toBe('dayGridMonth')
    expect(FC_VIEW_NAME.week).toBe('timeGridWeek')
    expect(FC_VIEW_NAME.day).toBe('timeGridDay')
  })

  it('switches to Week and reflects it in initialView', async () => {
    const { result } = renderHook(() => useEventCalendarView(), { wrapper })

    await act(async () => {
      result.current.setView('week')
    })

    expect(result.current.view).toBe('week')
    expect(result.current.initialView).toBe('timeGridWeek')
  })

  it('switches to Day and reflects it in initialView', async () => {
    const { result } = renderHook(() => useEventCalendarView(), { wrapper })

    await act(async () => {
      result.current.setView('day')
    })

    expect(result.current.view).toBe('day')
    expect(result.current.initialView).toBe('timeGridDay')
  })
})
