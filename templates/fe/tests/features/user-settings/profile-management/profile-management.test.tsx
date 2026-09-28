import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import { ProfileManagement } from '@/features/user-settings/profile-management/profile-management'
import messages from '@/messages/en.json'

vi.mock('@/features/user-settings/profile-management/(components)/personal-info', () => ({
  SettingPersonalInfo: () => {
    const { register } = useFormContext()
    return <input aria-label="First Name" {...register('firstName')} />
  },
}))
vi.mock('@/features/user-settings/profile-management/(components)/setting-address-card', () => ({
  SettingAddressCard: () => null,
}))
vi.mock('@/features/user-settings/profile-management/(components)/setting-language-region', () => ({
  SettingLanguageRegion: () => null,
}))
vi.mock('@/features/user-settings/profile-management/(components)/setting-theme-toggle', () => ({
  SettingThemeToggle: () => null,
}))

function Harness() {
  const methods = useForm({ defaultValues: { firstName: 'Original' } })

  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <FormProvider {...methods}>
        <form>
          <ProfileManagement
            addressState={{ primary: null, billing: null, shipping: null }}
            onAddressChange={vi.fn()}
          />
          <a href="/other-page">Navigate away</a>
        </form>
      </FormProvider>
    </NextIntlClientProvider>
  )
}

describe('ProfileManagement unsaved changes', () => {
  it('opens unsaved changes dialog without save action when form is dirty and user navigates', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    // Initially dialog is not open
    expect(screen.queryByRole('heading', { name: 'Unsaved Changes' })).not.toBeInTheDocument()

    // Type to make form dirty
    await user.type(screen.getByRole('textbox', { name: 'First Name' }), ' Modified')
    
    // Click navigation link to trigger guard
    await user.click(screen.getByRole('link', { name: 'Navigate away' }))

    // Unsaved changes dialog should open with custom description
    expect(screen.getByRole('heading', { name: 'Confirm Leave Page' })).toBeInTheDocument()
    expect(
      screen.getByText('You have unsaved information. Are you sure you want to leave?'),
    ).toBeInTheDocument()

    // It should have "Leave without saving" and "Stay on page" buttons, but NOT "Save & Leave" button
    expect(screen.getByRole('button', { name: 'Leave without saving' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Stay on page' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Save & Leave' })).not.toBeInTheDocument()
  })
})
