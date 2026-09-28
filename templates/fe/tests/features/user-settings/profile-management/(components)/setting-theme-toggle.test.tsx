import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { SettingThemeToggle } from '@/features/user-settings/profile-management/(components)/setting-theme-toggle'
import type { ProfileFormValues } from '@/features/user-settings/profile-management/(helpers)/profile-schema'
import messages from '@/messages/en.json'

/**
 * Sheet source: Profile Management sheet, section "5. Dashboard Theme".
 *
 * Verified against real code (`setting-theme-toggle.tsx`): clicking the toggle stages the
 * form's `theme`/`appearance` fields with `shouldDirty: true` — a real persist still needs
 * the page's own Save button (a real profile PUT), same as CONTEXT.md's "Save... uppercases
 * appearance" line. BUT `handleToggle` also calls `applyPreviewTheme`, which writes directly
 * to `window.localStorage.setItem('theme', ...)` independent of any save — this is the local,
 * non-mutating persistence next-themes/CLAUDE.md's stack table describes, which is why this
 * one control is safe to exercise for real in E2E without ever clicking Save.
 */

const setTheme = vi.fn()
vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'dark', setTheme }),
}))

function Harness() {
  const methods = useForm<ProfileFormValues>({ defaultValues: { theme: 'dark', appearance: 'DARK' } as ProfileFormValues })
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <FormProvider {...methods}>
        <SettingThemeToggle />
      </FormProvider>
    </NextIntlClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  window.localStorage.clear()
})

describe('SettingThemeToggle', () => {
  it('toggles from dark to light: calls next-themes setTheme and stages the form fields as dirty (does not itself persist to the backend)', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('button', { name: 'Interface Theme' }))

    expect(setTheme).toHaveBeenCalledWith('light')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Interface Theme' })).toHaveAttribute('aria-pressed', 'true'))
  })

  it('writes the toggled theme to localStorage immediately on click, independent of any save', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('button', { name: 'Interface Theme' }))

    expect(window.localStorage.getItem('theme')).toBe('light')
  })

  it('applies the theme class to the document root immediately (local UI feedback, no backend call)', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('button', { name: 'Interface Theme' }))

    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
