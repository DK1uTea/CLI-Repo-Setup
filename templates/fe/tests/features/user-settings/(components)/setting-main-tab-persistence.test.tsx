import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useFormContext } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import SettingMain from '@/features/user-settings/(components)/setting-main'

/**
 * Test-case source: Profile Management sheet — "Navigation": "Giữ dữ liệu khi quay
 * lại tab" (partial, unsaved input must survive switching away to another tab and back).
 *
 * `profileForm` is created once in `useProfileManagement` and lives in `SettingMain`,
 * *above* `TabsUrl` — confirmed live: Radix's `Tabs.Content` here keeps every panel
 * mounted (hidden, not unmounted) regardless of the active tab, so the input never
 * disappears from the DOM at all. Either way the form value is proven retained; this
 * asserts the actual observed DOM behavior instead of an assumed unmount/remount.
 */

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key, useLocale: () => 'de' }))
vi.mock('@/i18n/navigation', () => ({
  Link: (props: React.ComponentProps<'a'>) => <a {...props} />,
  usePathname: () => '/user-settings',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}))
vi.mock('next-themes', () => ({ useTheme: () => ({ theme: 'light', setTheme: vi.fn() }) }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const { get } = vi.hoisted(() => ({ get: vi.fn() }))
vi.mock('@/lib/api', () => ({ apiProxy: { get, put: vi.fn() } }))

vi.mock('@/features/user-settings/profile-management/profile-management', () => ({
  ProfileManagement: () => {
    const { register } = useFormContext()
    return <input aria-label="First Name" {...register('firstName')} />
  },
}))
vi.mock('@/features/user-settings/security-privacy/security-privacy', () => ({
  SecurityPrivacy: () => <div>SecurityPrivacy</div>,
}))
vi.mock('@/features/user-settings/roles-access/user-roles-access', () => ({
  UserRolesAccess: () => <div>UserRolesAccess</div>,
}))
vi.mock('@/features/user-settings/user-roles/manage-user-roles', () => ({
  ManageUserRoles: () => <div>ManageUserRoles</div>,
}))

function renderSettingMain() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <NuqsTestingAdapter>
        <SettingMain />
      </NuqsTestingAdapter>
    </QueryClientProvider>,
  )
}

describe('SettingMain — retains form input across a tab switch', () => {
  it('keeps a typed First Name value after switching to another tab and back', async () => {
    // Never resolves — the profile query staying pending keeps the sync effect from
    // overwriting the value the user is about to type.
    get.mockImplementation(() => new Promise(() => {}))
    const user = userEvent.setup()
    renderSettingMain()

    await user.type(screen.getByRole('textbox', { name: 'First Name' }), 'Hai')
    expect(screen.getByRole('textbox', { name: 'First Name' })).toHaveValue('Hai')

    await user.click(screen.getByRole('tab', { name: 'securityPrivacy' }))
    await user.click(screen.getByRole('tab', { name: 'profileManagement' }))

    expect(screen.getByRole('textbox', { name: 'First Name' })).toHaveValue('Hai')
  })
})
