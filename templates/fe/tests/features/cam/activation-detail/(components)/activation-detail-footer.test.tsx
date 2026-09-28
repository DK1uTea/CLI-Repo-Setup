import { NextIntlClientProvider } from 'next-intl'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import messages from '@/messages/en.json'
import ActivationDetailFooter from '@/features/cam/activation-detail/(components)/activation-detail-footer'
import type { ActivationDetail } from '@/features/cam/(hooks)/use-activation-detail'

const { updateStatus, setActivationTab, toastError, triggerValidation, permissions } = vi.hoisted(() => ({
  updateStatus: vi.fn(),
  setActivationTab: vi.fn(),
  toastError: vi.fn(),
  triggerValidation: vi.fn(),
  permissions: ['*'] as string[],
}))

vi.mock('nuqs', () => ({
  parseAsString: {},
  useQueryState: () => ['overview', setActivationTab],
}))

vi.mock('@/shared/stores/use-user-store', () => ({
  useUserStore: (selector: (state: { permissions: string[] }) => unknown) =>
    selector({ permissions }),
}))

vi.mock('@/features/cam/activation-view/(hooks)/use-update-activation-status', () => ({
  useUpdateActivationStatus: () => ({ mutate: updateStatus, isPending: false }),
}))

vi.mock('@/features/cam/activation-detail/(hooks)/use-feedback-drawer-url', () => ({
  useFeedbackDrawerUrl: () => ({ openDrawer: vi.fn() }),
}))

vi.mock('@/features/cam/activation-detail/(hooks)/use-scoring-validator-store', () => ({
  useScoringValidatorStore: (selector: (state: { isApproving: boolean }) => unknown) =>
    selector({ isApproving: false }),
  triggerScoringValidation: triggerValidation,
  callScoringApprove: vi.fn(),
}))

vi.mock('sonner', () => ({ toast: { error: toastError } }))

function activation(score: number | null, status = 'REVIEW'): ActivationDetail {
  return {
    id: 'activation-1',
    status,
    evaluation: score == null ? null : { score, maxScore: 27 },
  } as ActivationDetail
}

describe('ActivationDetailFooter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    permissions.splice(0, permissions.length, '*')
    triggerValidation.mockResolvedValue(false)
  })

  it('does not expose the Ready status action to an agency role', () => {
    permissions.splice(0, permissions.length, 'customer-activation.printing-agency')

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ActivationDetailFooter activationDetail={activation(null, 'READY')} />
      </NextIntlClientProvider>,
    )

    expect(screen.queryByRole('button', { name: 'Move to Review' })).not.toBeInTheDocument()
  })

  it('moves directly to approved from another tab when the activation has a positive score', async () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ActivationDetailFooter activationDetail={activation(1)} />
      </NextIntlClientProvider>,
    )

    await userEvent.setup().click(screen.getByRole('button', { name: 'Approve' }))

    expect(updateStatus).toHaveBeenCalledWith(
      { id: 'activation-1', status: 'APPROVED' },
      expect.any(Object),
    )
    expect(triggerValidation).not.toHaveBeenCalled()
    expect(toastError).not.toHaveBeenCalled()
    expect(setActivationTab).not.toHaveBeenCalled()
  })

  it('opens scoring instead of approving from another tab when the score is missing', async () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ActivationDetailFooter activationDetail={activation(null)} />
      </NextIntlClientProvider>,
    )

    await userEvent.setup().click(screen.getByRole('button', { name: 'Approve' }))

    expect(updateStatus).not.toHaveBeenCalled()
    expect(toastError).toHaveBeenCalledWith('Please complete the scoring before approving.')
    expect(setActivationTab).toHaveBeenCalledWith('scoring')
  })
})
