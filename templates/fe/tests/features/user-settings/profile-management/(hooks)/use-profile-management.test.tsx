import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useProfileManagement } from '@/features/user-settings/profile-management/(hooks)/use-profile-management'

/**
 * Test-case source: Profile Management sheet — "Save/Invite" section: "Save khi
 * không có thay đổi", "Save khi có lỗi validate", "Tránh double-click Save".
 */

const { get, put } = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn() }))
vi.mock('@/lib/api', () => ({ apiProxy: { get, put } }))
vi.mock('next-themes', () => ({ useTheme: () => ({ theme: 'light', setTheme: vi.fn() }) }))
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key, useLocale: () => 'de' }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const VALID_PROFILE_RESPONSE = {
  data: {
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: null,
      avatar: null,
      settings: { appearance: 'LIGHT' },
      languageRegion: { preferredLanguage: 'de' },
    },
  },
}

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper }
}

beforeEach(() => {
  vi.clearAllMocks()
  get.mockResolvedValue(VALID_PROFILE_RESPONSE)
  put.mockResolvedValue({ data: {} })
})

describe('useProfileManagement — Save with no changes', () => {
  it('still submits the unchanged profile data — there is no dirty-state guard on Save', async () => {
    // Sheet expectation is ambiguous ("no error or button disabled"). Confirmed live:
    // handleSaveSettings has no isDirty check, so clicking Save with zero edits still
    // calls the real PUT with the currently-loaded values. Documented as the real
    // behavior rather than assumed blocked/no-op.
    const { wrapper } = setup()
    const { result } = renderHook(() => useProfileManagement(), { wrapper })

    await waitFor(() => expect(result.current.profileSetting).toBeDefined())

    await act(async () => {
      await result.current.handleSaveSettings()
    })

    expect(put).toHaveBeenCalledTimes(1)
    expect(put).toHaveBeenCalledWith(
      '/user/profile',
      expect.objectContaining({ firstName: 'John', lastName: 'Doe' }),
    )
  })
})

describe('useProfileManagement — Save with validation errors', () => {
  function ValidationHarness() {
    const { profileForm, handleSaveSettings } = useProfileManagement()
    return (
      <div>
        <input aria-label="First Name" {...profileForm.register('firstName')} />
        <input aria-label="Last Name" {...profileForm.register('lastName')} />
        <button onClick={handleSaveSettings}>Save</button>
      </div>
    )
  }

  it('focuses the first invalid field (First Name) when required fields are empty', async () => {
    // Never resolves — keeps the form at its all-empty defaultValues so both
    // firstName/lastName fail the schema's required/min:2 rule on submit.
    get.mockImplementation(() => new Promise(() => {}))
    const { wrapper } = setup()
    const user = userEvent.setup()
    render(<ValidationHarness />, { wrapper })

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(put).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox', { name: 'First Name' })).toHaveFocus()
  })
})

describe('useProfileManagement — double-click Save', () => {
  function SaveHarness() {
    const { profileSetting, handleSaveSettings, isSavingSettings } = useProfileManagement()
    return (
      <div>
        <span>{profileSetting ? 'loaded' : 'loading'}</span>
        <button onClick={handleSaveSettings} disabled={isSavingSettings}>
          Save
        </button>
      </div>
    )
  }

  it('processes only once — the button disables itself before a second click can land', async () => {
    let resolvePut: (value: unknown) => void = () => {}
    put.mockImplementation(() => new Promise((resolve) => { resolvePut = resolve }))

    const { wrapper } = setup()
    const user = userEvent.setup()
    render(<SaveHarness />, { wrapper })

    await screen.findByText('loaded')
    const button = screen.getByRole('button', { name: 'Save' })

    await user.click(button)
    expect(button).toBeDisabled()

    // A second click while disabled is a real-browser no-op (pointer-events skip it).
    await user.click(button)
    expect(put).toHaveBeenCalledTimes(1)

    resolvePut({ data: {} })
    await waitFor(() => expect(button).toBeEnabled())
  })
})
