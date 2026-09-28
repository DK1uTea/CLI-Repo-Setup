import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { EventDetailDownloadPdf } from '@/features/events/event-detail/event/(components)/event-detail-download-pdf';

const { stepDetailEnabledCalls, downloadMock } = vi.hoisted(() => ({
  stepDetailEnabledCalls: [] as boolean[],
  downloadMock: vi.fn(),
}));

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('@/shared/stores/use-user-store', () => ({
  useDateFormat: () => 'DD/MM/YYYY',
  useCurrency: () => ({ symbol: '€' }),
  useHasPermission: () => true,
}));
vi.mock('@/features/events/event-detail/common/(components)/event-common-pdf-content-wrapper', () => ({
  EventCommonPdfContentWrapper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pdf-wrapper">{children}</div>
  ),
}));
vi.mock('@/features/events/event-detail/event/(components)/event-detail-pdf-content', () => ({
  EventDetailPdfContent: () => <div data-testid="pdf-content" />,
  getPrintedAt: () => '',
}));
vi.mock('@/features/events/event-detail/common/(hooks)/use-download-pdf', () => ({
  useDownloadPdf: () => ({ contentRef: { current: null }, downloading: false, download: downloadMock }),
}));
vi.mock('@/features/events/event-form/(hooks)/use-event-step-detail', () => ({
  useEventStepDetail: (_id: string, _step: string, options?: { enabled?: boolean }) => {
    const enabled = !!options?.enabled;
    stepDetailEnabledCalls.push(enabled);
    return {
      data: enabled
        ? { general: { id: 'event-1' }, overview: { customEventId: 'EVENT-1' } }
        : undefined,
      isFetching: false,
    };
  },
}));

beforeEach(() => {
  stepDetailEnabledCalls.length = 0;
  downloadMock.mockClear();
});

describe('EventDetailDownloadPdf', () => {
  it('does not request the summary detail until the button is clicked', () => {
    render(<EventDetailDownloadPdf eventId="event-1" />);

    expect(stepDetailEnabledCalls.every((enabled) => enabled === false)).toBe(true);
    expect(screen.queryByTestId('pdf-content')).not.toBeInTheDocument();
    expect(downloadMock).not.toHaveBeenCalled();
  });

  it('requests the summary and downloads the PDF once the button is clicked', async () => {
    const user = userEvent.setup();
    render(<EventDetailDownloadPdf eventId="event-1" />);

    await user.click(screen.getByRole('button', { name: /downloadPdf/i }));

    expect(stepDetailEnabledCalls.some((enabled) => enabled === true)).toBe(true);
    expect(await screen.findByTestId('pdf-content')).toBeInTheDocument();
    expect(downloadMock).toHaveBeenCalledWith('EVENT-1.pdf');
  });
});
