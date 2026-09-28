import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useSubmitStepStore } from '@/features/cam/activation-form/(hooks)/use-submit-step-store'

const createMutate = vi.hoisted(() => vi.fn())
const openExisting = vi.hoisted(() => vi.fn())

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('nuqs', () => ({
  parseAsBoolean: { withDefault: () => ({}) },
  parseAsInteger: { withDefault: () => ({}) },
  useQueryState: () => {
    return [false, vi.fn()]
  },
}))

vi.mock('@/features/cam/activation-form/(hooks)/use-create-store', () => ({
  useCreateStore: () => ({ mutate: createMutate, isPending: false }),
}))

vi.mock('@/features/cam/activation-form/(hooks)/use-update-store', () => ({
  useUpdateStore: () => ({ mutate: vi.fn(), isPending: false }),
}))

vi.mock('@/features/cam/activation-form/(hooks)/use-store-tab', () => ({
  useStoreTab: () => ({
    mode: 'new',
    editStoreId: '',
    openExisting,
    returnToStep2: vi.fn(),
  }),
}))

describe('useSubmitStepStore', () => {
  it('advances to activation step after creating a new store', () => {
    const { result } = renderHook(() => useSubmitStepStore())

    act(() => {
      result.current.submit(
        {
          storeName: 'New store',
          storeAddress: 'Address',
          contactName: 'Contact',
          contactPhone: '+49123456789',
          contactEmail: 'contact@example.com',
        },
        vi.fn(),
      )
    })

    const options = createMutate.mock.calls[0]?.[1]
    act(() => options.onSuccess({ id: 'store-1' }))

    expect(openExisting).toHaveBeenCalledWith('store-1', 2)
  })
})
