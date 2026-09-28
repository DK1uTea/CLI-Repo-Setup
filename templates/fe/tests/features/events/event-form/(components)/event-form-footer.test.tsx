import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EventFormFooter } from '@/features/events/event-form/(components)/event-form-footer';

const { footerState } = vi.hoisted(() => ({
  footerState: {
    router: { push: vi.fn() },
    config: { steps: ['overview', 'logistics', 'product_catalog', 'helping_hand', 'summary'], cancelHref: '/events' },
    isProductDetail: false,
    currentStep: 'overview' as string,
    isFirstStep: true,
    isLastStep: false,
    goToPrevStep: vi.fn(),
    eventIdParam: 'event-1' as string | null,
    referer: 'new-event',
    openDelete: false,
    setOpenDelete: vi.fn(),
    openDraft: false,
    setOpenDraft: vi.fn(),
    isPending: false,
    isCartEmptyStep: false,
    isDeadlineBlocked: false,
    isDisableField: false,
    isDraftUnavailableStep: false,
    onNext: vi.fn(),
    onConfirmDelete: vi.fn(),
    onConfirmDraft: vi.fn(),
    pendingDelete: false,
    pendingDraft: false,
    duplicate: vi.fn(),
  },
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/events/new-event',
}));

vi.mock('@/features/events/event-form/(hooks)/use-event-form-footer', () => ({
  useEventFormFooter: () => footerState,
}));

describe('EventFormFooter — Save as Draft availability', () => {
  it('enables Save as Draft on a step with a per-step submit endpoint', () => {
    footerState.currentStep = 'overview';
    footerState.isDraftUnavailableStep = false;

    render(<EventFormFooter />);

    const draftButtons = screen.getAllByRole('button', { name: /actions.saveAsDraft/ });
    draftButtons.forEach((button) => expect(button).toBeEnabled());
  });

  it('enables Save as Draft on Product Catalog without a per-step submit endpoint', () => {
    footerState.currentStep = 'product_catalog';
    footerState.isDraftUnavailableStep = true;

    render(<EventFormFooter />);

    const draftButtons = screen.getAllByRole('button', { name: /actions.saveAsDraft/ });
    draftButtons.forEach((button) => expect(button).toBeEnabled());
  });

  it('enables Save as Draft on Summary without a per-step submit endpoint', () => {
    footerState.currentStep = 'summary';
    footerState.isDraftUnavailableStep = true;

    render(<EventFormFooter />);

    const draftButtons = screen.getAllByRole('button', { name: /actions.saveAsDraft/ });
    draftButtons.forEach((button) => expect(button).toBeEnabled());
  });

  it('enables Save as Draft on the new-event overview step, before an eventId exists', () => {
    footerState.currentStep = 'overview';
    footerState.isDraftUnavailableStep = false;
    footerState.eventIdParam = null;

    render(<EventFormFooter />);

    const draftButtons = screen.getAllByRole('button', { name: /actions.saveAsDraft/ });
    draftButtons.forEach((button) => expect(button).toBeEnabled());
  });
});
