import { act, renderHook } from '@testing-library/react'
import axios from 'axios'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { apiProxy } from '@/lib/api'
import { useChangePassword } from '@/features/user-settings/security-privacy/(hooks)/use-change-password'

/**
 * Ground truth (use-change-password.ts):
 * - success (status 200) -> toast.success + all 3 fields cleared via form.setValue(..., '')
 * - error with error_code === 'USER.CURRENT_PASSWORD_INCORRECT' -> bound to currentPassword
 * - every other error code (including the backend's own
 *   'USER.NEW_PASSWORD_SAME_AS_CURRENT' — there is no client-side zod check for
 *   new === current) -> bound to newPassword
 * - onSubmit is form.handleSubmit(onSubmit): a zod validation failure never reaches apiProxy
 */

const toastSuccess = vi.fn()
const toastError = vi.fn()

vi.mock('sonner', () => ({ toast: { success: (...args: unknown[]) => toastSuccess(...args), error: (...args: unknown[]) => toastError(...args) } }))
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('@/lib/api', () => ({ apiProxy: { patch: vi.fn() } }))

function makeAxiosError(data: { error_code?: string; message?: string }) {
  return { response: { data } }
}

// react-hook-form's `formState` is a Proxy that only tracks/rerenders on keys actually
// accessed *during render* (the same way `change-password.tsx` destructures
// `formState: { errors }`). Touching `.errors` here during renderHook's render pass — not
// just after — is what makes react-hook-form's internal subscription pick up `setError`
// calls that happen inside the async onSubmit handler.
function useChangePasswordSubscribed() {
  const result = useChangePassword()
  void result.form.formState.errors
  return result
}

describe('useChangePassword', () => {
  beforeEach(() => {
    vi.mocked(apiProxy.patch).mockReset()
    toastSuccess.mockReset()
    toastError.mockReset()
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)
  })

  it('does not call the API when the form fails zod validation (empty fields)', async () => {
    const { result } = renderHook(() => useChangePasswordSubscribed())

    await act(async () => {
      await result.current.onSubmit({ preventDefault: () => {} } as unknown as React.BaseSyntheticEvent)
    })

    expect(apiProxy.patch).not.toHaveBeenCalled()
  })

  it('calls the API and clears all 3 fields, showing a success toast, on a 200 response', async () => {
    vi.mocked(apiProxy.patch).mockResolvedValueOnce({ status: 200, data: {} })
    const { result } = renderHook(() => useChangePasswordSubscribed())

    act(() => {
      result.current.form.setValue('currentPassword', 'OldPassw0rd!')
      result.current.form.setValue('newPassword', 'NewPassw0rd1@')
      result.current.form.setValue('confirmPassword', 'NewPassw0rd1@')
    })

    await act(async () => {
      await result.current.onSubmit({ preventDefault: () => {} } as unknown as React.BaseSyntheticEvent)
    })

    expect(apiProxy.patch).toHaveBeenCalledWith(
      '/user/change-password',
      expect.objectContaining({ currentPassword: 'OldPassw0rd!', newPassword: 'NewPassw0rd1@' }),
      expect.any(Object),
    )
    expect(toastSuccess).toHaveBeenCalled()
    expect(result.current.form.getValues('currentPassword')).toBe('')
    expect(result.current.form.getValues('newPassword')).toBe('')
    expect(result.current.form.getValues('confirmPassword')).toBe('')
  })

  it('binds a USER.CURRENT_PASSWORD_INCORRECT error to the currentPassword field, not newPassword', async () => {
    vi.mocked(apiProxy.patch).mockRejectedValueOnce(
      makeAxiosError({ error_code: 'USER.CURRENT_PASSWORD_INCORRECT' }),
    )
    const { result } = renderHook(() => useChangePasswordSubscribed())

    act(() => {
      result.current.form.setValue('currentPassword', 'WrongPassw0rd!')
      result.current.form.setValue('newPassword', 'NewPassw0rd1@')
      result.current.form.setValue('confirmPassword', 'NewPassw0rd1@')
    })

    await act(async () => {
      await result.current.onSubmit({ preventDefault: () => {} } as unknown as React.BaseSyntheticEvent)
    })

    expect(result.current.form.formState.errors.currentPassword?.type).toBe('manual')
    expect(result.current.form.formState.errors.newPassword).toBeUndefined()
  })

  // This is the real mechanism behind the sheet's "new password identical to current
  // password is blocked" case — there is no zod rule comparing newPassword to
  // currentPassword, only this backend error code surfacing like any other non-current
  // -password error, bound to newPassword.
  it('binds a USER.NEW_PASSWORD_SAME_AS_CURRENT error to the newPassword field', async () => {
    vi.mocked(apiProxy.patch).mockRejectedValueOnce(
      makeAxiosError({ error_code: 'USER.NEW_PASSWORD_SAME_AS_CURRENT' }),
    )
    const { result } = renderHook(() => useChangePasswordSubscribed())

    act(() => {
      result.current.form.setValue('currentPassword', 'SamePassw0rd!')
      result.current.form.setValue('newPassword', 'SamePassw0rd!')
      result.current.form.setValue('confirmPassword', 'SamePassw0rd!')
    })

    await act(async () => {
      await result.current.onSubmit({ preventDefault: () => {} } as unknown as React.BaseSyntheticEvent)
    })

    expect(result.current.form.formState.errors.newPassword?.type).toBe('manual')
    expect(result.current.form.formState.errors.currentPassword).toBeUndefined()
  })

  it.todo(
    '"login with new password works, old password fails" is an end-to-end backend behaviour ' +
      'claim, not independently verifiable from the FE unit level, and real E2E is barred from ' +
      'ever actually rotating the shared account\'s real password (docs/specs/user-settings.md ' +
      'Out of Scope) — flagging as pending rather than fabricating an assertion.',
  )
})
