import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'

import SettingMain from '@/features/user-settings/(components)/setting-main'

/**
 * Test-case source: Profile Management sheet — "Save/Invite" section: "Save Settings
 * không ảnh hưởng Invite" (saving the profile must not trigger the invite flow).
 */

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'de',
}))
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, ...props }: ComponentProps<'a'> & { href: string }) => <a href={href} {...props} />,
  usePathname: () => '/user-settings',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}))
vi.mock('@/features/user-settings/profile-management/profile-management', () => ({
  ProfileManagement: () => <div>ProfileManagement</div>,
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

const handleSaveSettings = vi.fn()
vi.mock('@/features/user-settings/profile-management/(hooks)/use-profile-management', () => ({
  useProfileManagement: () => ({
    // Loose shape — the mocked ProfileManagement never reads form context, so
    // FormProvider only needs something syntactically acceptable, not real RHF methods.
    profileForm: {},
    profileSetting: undefined,
    addressState: { primary: null, billing: null, shipping: null },
    handleAddressChange: vi.fn(),
    handleSaveSettings,
    isSavingSettings: false,
  }),
}))

describe('SettingMain — Save Settings vs Invite User', () => {
  it('clicking Save Settings only saves the profile and never touches the Invite User flow', async () => {
    const user = userEvent.setup()
    render(
      <NuqsTestingAdapter>
        <SettingMain />
      </NuqsTestingAdapter>,
    )

    const inviteLink = screen.getByRole('link', { name: 'inviteUser' })
    expect(inviteLink).toHaveAttribute('href', expect.stringContaining('/user-settings/invite-user'))

    await user.click(screen.getByRole('button', { name: 'saveSettings' }))

    expect(handleSaveSettings).toHaveBeenCalledTimes(1)
    // Still on the same page — Save never navigates to the invite route.
    expect(screen.queryByText('inviteUser')).not.toBeNull()
    expect(inviteLink).toHaveAttribute('href', expect.stringContaining('/user-settings/invite-user'))
  })
})
