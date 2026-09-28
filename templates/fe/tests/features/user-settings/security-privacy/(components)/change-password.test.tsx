import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { ChangePassword } from '@/features/user-settings/security-privacy/(components)/change-password'
import { apiProxy } from '@/lib/api'
import { FieldErrorsInit } from '@/lib/field-errors-init'
import messages from '@/messages/en.json'

/**
 * Ground truth (change-password.tsx):
 * - each of the 3 password inputs has its own show/hide eye-icon toggle (aria-pressed +
 *   aria-label that flips between "Show password"/"Hide password"), toggling type
 *   password/text.
 * - newPassword's own <p role="alert"> only renders when errors.newPassword.type ===
 *   'manual' (backend error) OR the field is empty — while typing a non-empty password
 *   that merely fails a checklist rule, only PasswordChecklist communicates it (no
 *   duplicate error banner).
 */

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('@/lib/api', () => ({ apiProxy: { patch: vi.fn() } }))

function renderChangePassword() {
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {/* Mounted the same way the real root layout does — zod's `getValidationMessage`
          reads a module-level translator set by this component's effect; without it,
          field-error messages render as their raw `fieldErrors.*` key instead of text. */}
      <FieldErrorsInit />
      <ChangePassword />
    </NextIntlClientProvider>,
  )
}

describe('ChangePassword', () => {
  beforeEach(() => {
    vi.mocked(apiProxy.patch).mockReset()
  })

  it('rejects all three fields empty on submit and does not call the API', async () => {
    // Sheet claims three distinct messages ("Current password is required" / "Password is
    // required" / "Confirm password is required"). Confirmed against the real schema:
    // all three fields use `zString(['required'])`/`zPassword()`, which both resolve to the
    // one shared generic message `fieldErrors.required` ("This field is required") — there
    // is no per-field custom required text anywhere in the schema or messages/en.json.
    // Asserting the sheet's distinct strings would fail against real behavior, so this
    // asserts the actual (identical, generic) message on all three fields instead.
    const user = userEvent.setup()
    renderChangePassword()

    await user.click(screen.getByRole('button', { name: 'Password Change' }))

    const alerts = await screen.findAllByRole('alert')
    expect(alerts).toHaveLength(3)
    for (const alert of alerts) {
      expect(alert).toHaveTextContent('This field is required')
    }
    expect(apiProxy.patch).not.toHaveBeenCalled()
  })

  it.todo(
    'shows field-specific required messages ("Current password is required" / "Password is ' +
      'required" / "Confirm password is required") — sheet-specified, not yet implemented: ' +
      'the schema only produces one shared generic message for all three fields. Flagged back ' +
      'for a product/dev decision instead of silently asserting the current, sheet-' +
      'contradicting behaviour.',
  )

  it('toggles the current-password field between hidden and visible via its eye icon', async () => {
    const user = userEvent.setup()
    renderChangePassword()

    const input = screen.getByPlaceholderText('Enter Current Password')
    const toggle = screen.getAllByRole('button', { name: 'Show password' })[0]
    expect(input).toHaveAttribute('type', 'password')
    expect(toggle).toHaveAttribute('aria-pressed', 'false')

    await user.click(toggle)

    expect(input).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('toggles the new-password field visibility independently from the other two fields', async () => {
    const user = userEvent.setup()
    renderChangePassword()

    const newInput = screen.getByPlaceholderText('Enter New Password')
    const toggles = screen.getAllByRole('button', { name: 'Show password' })
    // order: current, new, confirm
    await user.click(toggles[1])

    expect(newInput).toHaveAttribute('type', 'text')
    const currentInput = screen.getByPlaceholderText('Enter Current Password')
    expect(currentInput).toHaveAttribute('type', 'password')
  })

  it('suppresses the inline new-password error while a non-empty password merely fails a checklist rule', async () => {
    const user = userEvent.setup()
    renderChangePassword()

    const newInput = screen.getByPlaceholderText('Enter New Password')
    // Clicking + pasting instead of a long `.type()` call — this session found `.type()` on
    // a long string flakes under full-suite parallel load; paste is the hardened pattern.
    await user.click(newInput)
    await user.paste('short')

    // The checklist itself is rendered (communicates the failing rules)...
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument()
    // ...but there is no separate <p role="alert"> duplicating that failure for this field.
    const alerts = screen.queryAllByRole('alert')
    expect(alerts.every((el) => !el.textContent?.toLowerCase().includes('password'))).toBe(true)
  })

  it('submits with all fields valid and calls the change-password API', async () => {
    vi.mocked(apiProxy.patch).mockResolvedValueOnce({ status: 200, data: {} })
    const user = userEvent.setup()
    renderChangePassword()

    await user.click(screen.getByPlaceholderText('Enter Current Password'))
    await user.paste('OldPassw0rd!')
    await user.click(screen.getByPlaceholderText('Enter New Password'))
    await user.paste('NewPassw0rd1@')
    await user.click(screen.getByPlaceholderText('Confirm New Password'))
    await user.paste('NewPassw0rd1@')

    await user.click(screen.getByRole('button', { name: 'Password Change' }))

    expect(apiProxy.patch).toHaveBeenCalledWith(
      '/user/change-password',
      expect.objectContaining({ newPassword: 'NewPassw0rd1@' }),
      expect.any(Object),
    )
  })

  it('blocks submit and never calls the API when one checklist requirement still fails', async () => {
    const user = userEvent.setup()
    renderChangePassword()

    await user.click(screen.getByPlaceholderText('Enter Current Password'))
    await user.paste('OldPassw0rd!')
    await user.click(screen.getByPlaceholderText('Enter New Password'))
    await user.paste('nouppercase1@') // missing uppercase letter
    await user.click(screen.getByPlaceholderText('Confirm New Password'))
    await user.paste('nouppercase1@')

    await user.click(screen.getByRole('button', { name: 'Password Change' }))

    expect(apiProxy.patch).not.toHaveBeenCalled()
  })
})
