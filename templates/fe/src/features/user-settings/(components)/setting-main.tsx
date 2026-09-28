'use client'

import { useTranslations } from 'next-intl'
import { FormProvider } from 'react-hook-form'
import { Button } from '@/shared/components/ui/button'
import { TabsUrl } from '@/shared/components/ui/tabs-url'
import { TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs'
import { ProfileManagement } from '../profile-management/profile-management'
import { SecurityPrivacy } from '../security-privacy/security-privacy'
import { UserRolesAccess } from '../roles-access/user-roles-access'
import { ManageUserRoles } from '../user-roles/manage-user-roles'
import { useProfileManagement } from '../profile-management/(hooks)/use-profile-management'
import { useQueryState } from 'nuqs'
import { ComponentGuard } from '@/shared/components/common/component-guard'
import { PERMISSION_ALL_WILDCARD } from '@/shared/constants/permissions'

const DEFAULT_TAB = 'profile-management'

function SettingMain() {
  const t = useTranslations('settings')
  const {
    profileForm,
    profileSetting,
    addressState,
    handleAddressChange,
    handleSaveSettings,
    isSavingSettings,
  } = useProfileManagement()
  const [activeTab] = useQueryState('tab', { defaultValue: DEFAULT_TAB })

  const hrefInviteUser = `/user-settings/invite-user?referer=${activeTab}`

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-[22px] font-bold text-foreground">{t('userSettings')}</h1>
        <div className="flex gap-3">
          <ComponentGuard requiredKeys={PERMISSION_ALL_WILDCARD}>
            <Button variant="outline-primary" href={hrefInviteUser}>
              {t('inviteUser')}
            </Button>
          </ComponentGuard>
          {activeTab === DEFAULT_TAB && (
            <Button onClick={handleSaveSettings} disabled={isSavingSettings}>
              {t('saveSettings')}
            </Button>
          )}
        </div>
      </div>

      <TabsUrl defaultValue={DEFAULT_TAB}>
        <TabsList variant="line">
          <TabsTrigger value="profile-management">{t('profileManagement')}</TabsTrigger>
          <TabsTrigger value="security-privacy">{t('securityPrivacy')}</TabsTrigger>
          <ComponentGuard requiredKeys={PERMISSION_ALL_WILDCARD}>
            <TabsTrigger value="user-roles-access">{t('userRolesAccess')}</TabsTrigger>
            <TabsTrigger value="manage-user-roles">{t('manageUserRoles')}</TabsTrigger>
          </ComponentGuard>
        </TabsList>

        <TabsContent value="profile-management" className="mt-3">
          <FormProvider {...profileForm}>
            <ProfileManagement
              profileSetting={profileSetting}
              addressState={addressState}
              onAddressChange={handleAddressChange}
            />
          </FormProvider>
        </TabsContent>

        <TabsContent value="security-privacy" className="mt-3">
          <SecurityPrivacy />
        </TabsContent>

        <ComponentGuard requiredKeys={PERMISSION_ALL_WILDCARD}>
          <TabsContent value="user-roles-access" className="mt-3">
            <UserRolesAccess />
          </TabsContent>

          <TabsContent value="manage-user-roles" className="mt-3">
            <ManageUserRoles />
          </TabsContent>
        </ComponentGuard>
      </TabsUrl>
    </div>
  )
}

export default SettingMain
