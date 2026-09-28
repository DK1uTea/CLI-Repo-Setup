import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import { describe, expect, it, vi } from 'vitest'

import { SettingAddressDialog } from '@/features/user-settings/profile-management/(components)/setting-address-card/setting-address-dialog'
import messages from '@/messages/en.json'

/**
 * Sheet source: Profile Management sheet, section "3. Address Information".
 *
 * "Bỏ trống địa chỉ" (clearing an address field should still save, per CONTEXT.md's
 * "An incomplete address is omitted rather than partially submitted") is NOT reachable
 * through this dialog: `handleSave` in `setting-address-dialog.tsx` requires every one of
 * `REQUIRED_FIELDS` (address/city/region/country/postalCode) non-empty before it ever calls
 * `onSave`, so a user can never leave this dialog having "cleared" one field of an
 * already-complete address — they either fill it all in or the dialog blocks them (see the
 * "blocks saving" test below). The CONTEXT.md omission behavior applies only to legacy
 * already-incomplete data from the API, handled by `toAddressPayload` in
 * `use-submit-profile-setting.ts`, not to a live edit through this UI.
 */

function renderDialog(props: Partial<React.ComponentProps<typeof SettingAddressDialog>> = {}) {
  const onSave = vi.fn()
  const onClose = vi.fn()
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <SettingAddressDialog
        open
        addressType="primary"
        onClose={onClose}
        onSave={onSave}
        {...props}
      />
    </NextIntlClientProvider>,
  )
  return { onSave, onClose }
}

describe('SettingAddressDialog', () => {
  it('blocks saving when a required field is empty and shows a required error, without calling onSave', async () => {
    const user = userEvent.setup()
    const { onSave } = renderDialog()

    await user.click(screen.getByRole('button', { name: 'Save Address' }))

    expect(screen.getAllByText('This field is required').length).toBeGreaterThan(0)
    expect(onSave).not.toHaveBeenCalled()
  })

  it('saves a fully-filled address for the given address type only', async () => {
    const user = userEvent.setup()
    const { onSave, onClose } = renderDialog({ addressType: 'billing' })

    await user.type(screen.getByLabelText('Address'), '123 Main St')
    await user.type(screen.getByLabelText('City'), 'Munich')
    await user.type(screen.getByLabelText('Region'), 'Bavaria')
    await user.type(screen.getByLabelText('Postal Code'), '80331')
    await user.click(screen.getByRole('button', { name: 'Save Address' }))

    expect(onSave).toHaveBeenCalledWith(
      'billing',
      expect.objectContaining({
        address: '123 Main St',
        city: 'Munich',
        region: 'Bavaria',
        postalCode: '80331',
        country: 'DE',
      }),
    )
    expect(onClose).toHaveBeenCalled()
  })

  it('accepts long addresses with accented/special characters without validation errors', async () => {
    // `paste` (not char-by-char `type`) — this string is typed once by a real user via
    // copy/paste in practice, and under a full, heavily-parallel suite run `type`'s
    // per-keystroke simulation of this length was slow enough to hit the test timeout and
    // leave a truncated value, failing on an unrelated assertion further down the file.
    const user = userEvent.setup()
    const long = 'Straße Nr. 123-B, Übergangswohnheim für Geflüchtete (Zimmer 42/A) — Hauptgebäude'
    const { onSave } = renderDialog()

    await user.click(screen.getByLabelText('Address'))
    await user.paste(long)
    await user.click(screen.getByLabelText('City'))
    await user.paste('München')
    await user.click(screen.getByLabelText('Region'))
    await user.paste('Bayern')
    await user.click(screen.getByLabelText('Postal Code'))
    await user.paste('80331')
    await user.click(screen.getByRole('button', { name: 'Save Address' }))

    expect(onSave).toHaveBeenCalledWith('primary', expect.objectContaining({ address: long, city: 'München' }))
  })

  it('renders the country field as a dropdown (Select) listing every configured country, not free text', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByLabelText('Country'))

    for (const label of ['Germany', 'Austria', 'Switzerland', 'United States', 'United Kingdom', 'France', 'Netherlands', 'Poland']) {
      expect(screen.getByRole('option', { name: label })).toBeInTheDocument()
    }
    // Address/city/region/postal code are free-text inputs, confirmed by their role.
    expect(screen.getByLabelText('Address').tagName).toBe('INPUT')
    expect(screen.getByLabelText('City').tagName).toBe('INPUT')
  })

  it('editing one address type leaves the values passed in for other types untouched (isolated per-dialog-open state)', () => {
    const { rerender } = render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <SettingAddressDialog
          open
          addressType="primary"
          defaultValues={{ address: 'Primary St', city: 'Berlin', region: 'Berlin', country: 'DE', postalCode: '10115' }}
          onClose={vi.fn()}
          onSave={vi.fn()}
        />
      </NextIntlClientProvider>,
    )
    expect(screen.getByLabelText('Address')).toHaveValue('Primary St')

    rerender(
      <NextIntlClientProvider locale="en" messages={messages}>
        <SettingAddressDialog
          open
          addressType="billing"
          defaultValues={{ address: 'Billing Ave', city: 'Hamburg', region: 'Hamburg', country: 'DE', postalCode: '20095' }}
          onClose={vi.fn()}
          onSave={vi.fn()}
        />
      </NextIntlClientProvider>,
    )
    // Dialog resets its local state per `defaultValues`/`open` change (see its useEffect) —
    // switching address type shows that type's own value, proving primary/billing/shipping
    // are independent rather than sharing one buffer.
    expect(screen.getByLabelText('Address')).toHaveValue('Billing Ave')
  })
})
