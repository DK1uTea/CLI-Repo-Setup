import { render, screen, waitFor } from '@testing-library/react';
import { useWatch } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { useEventForm } from '@/features/events/event-form/(hooks)/use-event-form';
import type { EventFormDto } from '@/features/events/event-form/(helpers)/event-form-schema';

const { stepDetail } = vi.hoisted(() => ({
  stepDetail: {
    general: {
      id: '4adc3ca8-49ed-4a58-a838-b5339161e78e',
      name: 'Praesentium aut quia',
      startTime: '2026-08-11T00:00:00.000Z',
      status: 'DRAFT',
    },
    logistics: null,
    canEdit: false,
    isOwner: true,
  },
}));

const { deadline, detailStore, stepState, stepDetailCalls } = vi.hoisted(() => ({
  deadline: { deadline: '2026-07-30' },
  detailStore: { setIsFormLoading: vi.fn() },
  stepState: { current: 'logistics' },
  stepDetailCalls: [] as { eventId: string; step: string | null; enabled?: boolean }[],
}));

vi.mock('nuqs', () => ({
  parseAsString: { withDefault: (value: string) => value },
  useQueryState: (key: string) => [key === 'eventId' ? '4adc3ca8-49ed-4a58-a838-b5339161e78e' : stepState.current, vi.fn()],
}));

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/events/new-event',
}));

vi.mock('@/features/events/event-form/(hooks)/use-event-actions', () => ({
  useEventActions: () => ({}),
}));

vi.mock('@/features/events/event-form/(hooks)/use-event-deadline', () => ({
  useEventDeadline: () => ({ data: deadline, isLoading: false }),
}));

vi.mock('@/features/events/event-form/(hooks)/use-event-step-detail', () => ({
  useEventStepDetail: (eventId: string, step: string | null, options?: { enabled?: boolean }) => {
    stepDetailCalls.push({ eventId, step, enabled: options?.enabled });
    const enabled = !!step && (options?.enabled ?? true);
    return {
      data: enabled ? stepDetail : undefined,
      isFetching: false,
      isFetched: enabled,
    };
  },
}));

vi.mock('@/features/events/(stores)/use-event-detail-store', () => ({
  useEventDetailStore: (selector?: (state: { setIsFormLoading: () => void }) => unknown) =>
    selector ? selector(detailStore) : detailStore,
}));

function EventFormProbe({ defaultValues }: { defaultValues?: Partial<EventFormDto> }) {
  const { methods } = useEventForm(defaultValues);
  const values = useWatch({ control: methods.control });

  return <output data-testid="event-form-values">{JSON.stringify(values)}</output>;
}

describe('useEventForm', () => {
  it('leaves Logistics dates empty on Overview so they can use the final Event dates', async () => {
    stepState.current = 'overview';
    render(<EventFormProbe />);

    await waitFor(() => {
      const values = JSON.parse(screen.getByTestId('event-form-values').textContent ?? '{}');
      expect(values.setupStartDate).toBe('');
      expect(values.teardownStartDate).toBe('');
    });
  });

  it('uses Setup defaults without a deadline clamp on create Step 2 after Overview created an event with no logistics', async () => {
    stepState.current = 'logistics';
    render(<EventFormProbe />);

    await waitFor(() => {
      const values = JSON.parse(screen.getByTestId('event-form-values').textContent ?? '{}');

      expect(values).toMatchObject({
        setupStartDate: '2026-07-29',
        setupEndDate: '2026-07-30',
        teardownStartDate: '2026-08-01',
        teardownEndDate: '2026-08-02',
      });
    });
  });

  it('derives empty Logistics dates from current Event dates without replacing existing values', async () => {
    stepState.current = 'logistics';
    render(<EventFormProbe defaultValues={{
      startDate: '2026-08-05', endDate: '2026-08-07', setupStartTime: '09:30',
    }} />);

    await waitFor(() => {
      const values = JSON.parse(screen.getByTestId('event-form-values').textContent ?? '{}');
      expect(values).toMatchObject({
        setupStartDate: '2026-08-04', setupStartTime: '09:30',
        setupEndDate: '2026-08-05', setupEndTime: '00:00',
        teardownStartDate: '2026-08-08', teardownStartTime: '00:00',
        teardownEndDate: '2026-08-09', teardownEndTime: '00:00',
      });
    });
  });

  it('fetches Helping Hands detail on the Product Catalog step for general info', async () => {
    stepState.current = 'product_catalog';
    stepDetailCalls.length = 0;
    render(<EventFormProbe />);

    await waitFor(() => {
      expect(stepDetailCalls.length).toBeGreaterThan(0);
    });
    expect(stepDetailCalls.every((call) => call.step === 'helping_hand')).toBe(true);
  });
});
