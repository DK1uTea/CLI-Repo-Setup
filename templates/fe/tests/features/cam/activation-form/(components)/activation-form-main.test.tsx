import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { describe, expect, it, vi } from 'vitest'
import { ActivationFormMain } from '@/features/cam/activation-form/(components)/activation-form-main'

const openEditStore = vi.hoisted(() => vi.fn())

const activationDetail = vi.hoisted(() => ({
  name: 'Activation',
  responsibleCam: '',
  numberOfOutlets: [],
  outletNotes: '',
  highTrafficZones: [],
  highTrafficZoneNotes: '',
  targetGroups: [],
  targetGroupNotes: '',
  salesConcepts: [],
  salesConceptNotes: '',
  contractSituations: [],
  contractSituationNotes: '',
  revenuePotentials: [],
  ahMarket: false,
  ahMarketMediaUrls: [],
  aMarket: false,
  aMarketMediaUrls: [],
  brandFit: [],
  brandFitNotes: '',
  profitability: [],
  store: { id: 'original-store' },
}))

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}))

vi.mock('@/shared/stores/use-user-store', () => ({
  useUserStore: (selector: (state: { permissions: string[] }) => unknown) =>
    selector({ permissions: [] }),
}))

vi.mock('@/features/cam/(hooks)/use-activation-detail', () => ({
  useActivationDetail: () => ({
    isLoading: false,
    data: activationDetail,
  }),
}))

vi.mock('@/features/cam/activation-form/(hooks)/use-submit-step-store', () => ({
  useSubmitStepStore: () => ({
    submit: vi.fn(),
    isCreating: false,
    isUpdating: false,
  }),
}))

vi.mock('@/features/cam/activation-form/(hooks)/use-submit-step-activation', () => ({
  useSubmitStepActivation: () => ({
    submit: vi.fn(),
    isSubmitting: false,
    submittedActivationId: '',
  }),
}))

vi.mock('@/features/cam/activation-form/(hooks)/use-store-tab', () => ({
  useStoreTab: () => ({
    mode: 'existing',
    openEditStore,
  }),
}))

vi.mock('@/features/cam/activation-form/(components)/activation-form-header', () => ({
  ActivationFormHeader: () => null,
}))

vi.mock('@/features/cam/activation-form/(components)/activation-form-step-indicator', () => ({
  ActivationFormStepIndicator: () => null,
}))

vi.mock('@/features/cam/activation-form/(components)/activation-form-footer', () => ({
  ActivationFormFooter: () => null,
}))

vi.mock('@/features/cam/activation-form/(components)/activation-success-dialog', () => ({
  ActivationSuccessDialog: () => null,
}))

vi.mock('@/features/cam/activation-form/(components)/steps/step-store/step-store', () => ({
  StepStore: ({ onSelectStore }: { onSelectStore: (id: string) => void }) => (
    <button type="button" onClick={() => onSelectStore('replacement-store')}>
      Select replacement store
    </button>
  ),
}))

vi.mock('@/features/cam/activation-form/(components)/steps/step-activation/step-activation', () => ({
  StepActivation: ({
    storeId,
    onEditStore,
  }: {
    storeId: string
    onEditStore: () => void
  }) => (
    <div>
      <span>Step 2 store: {storeId}</span>
      <button type="button" onClick={onEditStore}>Edit store</button>
    </div>
  ),
}))

describe('ActivationFormMain', () => {
  it('shows the newly selected existing store in step 2 while updating an activation', async () => {
    const user = userEvent.setup()
    render(
      <NuqsTestingAdapter
        searchParams="?activation_id=activation-1&storeId=original-store&step=2"
      >
        <ActivationFormMain mode="update" />
      </NuqsTestingAdapter>,
    )

    await user.click(await screen.findByRole('button', { name: 'Edit store' }))
    await user.click(
      await screen.findByRole('button', { name: 'Select replacement store' }),
    )

    expect(screen.getByText('Step 2 store: replacement-store')).toBeInTheDocument()
  })

  it('edits the activation store when URL store state has not been synchronized yet', async () => {
    openEditStore.mockClear()
    render(
      <NuqsTestingAdapter searchParams="?activation_id=activation-1&step=2">
        <ActivationFormMain mode="update" />
      </NuqsTestingAdapter>,
    )

    await userEvent.setup().click(
      await screen.findByRole('button', { name: 'Edit store' }),
    )

    expect(openEditStore).toHaveBeenCalledWith('original-store')
  })
})
