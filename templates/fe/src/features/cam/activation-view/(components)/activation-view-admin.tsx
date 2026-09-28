'use client'

import { useTranslations } from 'next-intl'
import { TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs'
import { TabsUrl } from '@/shared/components/ui/tabs-url'
import { ActivationAdminDashboard } from './tabs/activation-admin-dashboard'
import { ActivationAdminIntakeBoard } from './tabs/activation-admin-intake-board'
import { ActivationAdminStore } from './tabs/activation-admin-store'
import { ActivationViewLayout } from './activation-view-layout'

export function ActivationViewAdmin() {
  const t = useTranslations('activationView')

  return (
    <ActivationViewLayout>
      <TabsUrl defaultValue="dashboard">
        <TabsList variant="line">
          <TabsTrigger value="dashboard">{t('admin.tabDashboard')}</TabsTrigger>
          <TabsTrigger value="intake-board">{t('admin.tabIntakeBoard')}</TabsTrigger>
          <TabsTrigger value="store">{t('admin.tabStore')}</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className='mt-3'>
          <ActivationAdminDashboard />
        </TabsContent>
        <TabsContent value="intake-board" className='mt-3'>
          <ActivationAdminIntakeBoard />
        </TabsContent>
        <TabsContent value="store" className='mt-3'>
          <ActivationAdminStore />
        </TabsContent>
      </TabsUrl>
    </ActivationViewLayout>
  )
}
