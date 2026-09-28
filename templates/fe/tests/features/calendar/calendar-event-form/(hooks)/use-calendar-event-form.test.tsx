import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useCalendarEventForm } from '@/features/calendar/calendar-event-form/(hooks)/use-calendar-event-form';

const { useEventDeadlineMock } = vi.hoisted(() => ({ useEventDeadlineMock: vi.fn() }));

vi.mock('@/features/events/event-form/(hooks)/use-event-deadline', () => ({
  useEventDeadline: useEventDeadlineMock,
}));

describe('useCalendarEventForm', () => {
  it('defaults the start/end date to the deadline reference date, not a fixed 10-day offset', () => {
    useEventDeadlineMock.mockReturnValue({ data: { deadline: '2026-08-10' } });

    const { result } = renderHook(() => useCalendarEventForm());

    expect(result.current.methods.getValues('startDate')).toBe('2026-08-10');
    expect(result.current.methods.getValues('startTime')).toBe('00:00');
    expect(result.current.methods.getValues('endDate')).toBe('2026-08-11');
  });

  it('enables the deadline lookup only when creating (no existing defaultValues)', () => {
    useEventDeadlineMock.mockReturnValue({ data: undefined });
    renderHook(() => useCalendarEventForm({ startDate: '2026-01-01' }));

    expect(useEventDeadlineMock).toHaveBeenCalledWith(false);
  });

  it('does not override a start date already loaded for an existing event', () => {
    useEventDeadlineMock.mockReturnValue({ data: { deadline: '2026-08-10' } });

    const { result } = renderHook(() =>
      useCalendarEventForm({ startDate: '2026-01-01', startTime: '10:00' }),
    );

    expect(result.current.methods.getValues('startDate')).toBe('2026-01-01');
  });
});
