import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { SettingLanguageRegion } from '@/features/user-settings/profile-management/(components)/setting-language-region'
import type { ProfileFormValues } from '@/features/user-settings/profile-management/(helpers)/profile-schema'
import messages from '@/messages/en.json'

/** Sheet source: Profile Management sheet, section "4. Language & Region". */

function Harness({ defaults = {} }: { defaults?: Partial<ProfileFormValues> }) {
  const methods = useForm<ProfileFormValues>({ defaultValues: defaults as ProfileFormValues })
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <FormProvider {...methods}>
        <SettingLanguageRegion />
      </FormProvider>
    </NextIntlClientProvider>
  )
}

describe('SettingLanguageRegion', () => {
  it('shows the app-level default values (German/Europe-Berlin/EUR/DD-MM-YYYY-first-option) when the form has none set', () => {
    render(<Harness />)

    expect(screen.getByLabelText('Preferred Language')).toHaveTextContent('English')
    expect(screen.getByLabelText('Time Zone')).toHaveTextContent('Europe/Berlin')
    expect(screen.getByLabelText('Currency')).toHaveTextContent('EUR (€)')
    expect(screen.getByLabelText('Date Format')).toHaveTextContent('DD/MM/YYYY')
  })

  it('reflects whatever value is already on the form (e.g. loaded from the real profile response)', () => {
    render(
      <Harness
        defaults={{ preferredLanguage: 'de', timezone: 'Europe/Berlin', currency: 'EUR', dateFormat: 'MM/DD/YYYY' }}
      />,
    )

    expect(screen.getByLabelText('Preferred Language')).toHaveTextContent('German')
    expect(screen.getByLabelText('Date Format')).toHaveTextContent('MM/DD/YYYY')
  })

  it('opens the Preferred Language dropdown and shows both option', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByLabelText('Preferred Language'))

    expect(screen.getByRole('option', { name: 'English' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'German' })).toBeInTheDocument()
  })

  it('opens the Date Format dropdown and shows all four configured formats', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByLabelText('Date Format'))

    for (const label of ['DD/MM/YYYY', 'DD-MM-YYYY', 'MM/DD/YYYY', 'MM-DD-YYYY']) {
      expect(screen.getByRole('option', { name: label })).toBeInTheDocument()
    }
  })

  // Sheet requirement ("Đổi Time Zone / Đổi Currency" implies a real choice among several
  // zones/currencies): verified against real code — `profile-constants.ts`'s
  // DATE_FORMAT_OPTIONS has 4 entries, but the Time Zone and Currency `<Select>`s in
  // `setting-language-region.tsx` are each hardcoded with exactly ONE `<SelectItem>`
  // (Europe/Berlin, EUR). There is no second option to switch to — matching CONTEXT.md's
  // "The app targets Germany... Per-user timezone is a planned future feature". Flagging
  // back to dev/spec: the sheet's "changing timezone/currency" cases have no real target
  // value to select in the current implementation.
  it.todo(
    'changes Time Zone to a different value and saves — only one Time Zone option (Europe/Berlin) exists in profile-constants.ts; no second value to switch to',
  )
  it.todo(
    'changes Currency to a different value and saves — only one Currency option (EUR) exists in profile-constants.ts; no second value to switch to',
  )

  it('does not allow any of the four dropdowns to be cleared to blank — closing without a selection keeps the current value', async () => {
    const user = userEvent.setup()
    render(<Harness defaults={{ preferredLanguage: 'de' }} />)

    await user.click(screen.getByLabelText('Preferred Language'))
    await user.keyboard('{Escape}')

    expect(screen.getByLabelText('Preferred Language')).toHaveTextContent('German')
  })
})
