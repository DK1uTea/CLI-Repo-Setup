'use client'

import { useTranslations } from 'next-intl'
import { useStoreTab } from '../../../(hooks)/use-store-tab'
import { useStoreList } from '../../../(hooks)/use-store-list'
import { useStoreDetail } from '../../../(hooks)/use-store-detail'
import { StoreList } from './store-list'
import { StoreForm } from './store-form'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import type { UseFormSetError } from 'react-hook-form'
import type { StoreFormData } from '../../../(helpers)/activation-schema'

export const STORE_FORM_ID = 'cam-store-form'

type Props = {
  selectedStoreId: string
  onSelectStore: (id: string) => void
  onStoreSubmit: (data: StoreFormData, setError: UseFormSetError<StoreFormData>) => void
}

export function StepStore({ selectedStoreId, onSelectStore, onStoreSubmit }: Props) {
  const t = useTranslations('activationForm.store')
  const { mode, editStoreId, openNewStore, openEditStore, openExisting } = useStoreTab()
  const { stores, isLoading, search, setSearch } = useStoreList()
  const { data: storeDetail, isLoading: isDetailLoading } = useStoreDetail(editStoreId)

  const isFormTab = mode === 'new' || mode === 'edit'
  const formTabLabel = mode === 'edit' ? t('tabEdit') : t('tabNew')
  const activeTab = isFormTab ? 'form' : 'existing'

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        if (value === 'existing') openExisting()
        else if (!isFormTab) openNewStore()
      }}
      className="gap-5"
    >
      <TabsList variant="line" className="w-full">
        <TabsTrigger value="existing">{t('tabExisting')}</TabsTrigger>
        <TabsTrigger value="form">{formTabLabel}</TabsTrigger>
      </TabsList>

      {/* Existing store list */}
      <TabsContent value="existing">
        <StoreList
          stores={stores}
          isLoading={isLoading}
          search={search}
          onSearchChange={setSearch}
          selectedStoreId={selectedStoreId}
          onSelect={onSelectStore}
          onEdit={openEditStore}
        />
      </TabsContent>

      {/* New / Edit store form */}
      <TabsContent value="form">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-6 pt-6 pb-2">
            <h3 className="text-base font-bold text-foreground">{t('ownerContact')}</h3>
          </div>
          {mode === 'edit' && isDetailLoading ? (
            <div className="flex flex-col gap-5 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <StoreForm
              formId={STORE_FORM_ID}
              defaultValues={
                mode === 'edit' && storeDetail
                  ? {
                      storeId: storeDetail.id,
                      storeName: storeDetail.storeName,
                      storeAddress: storeDetail.storeAddress,
                      contactName: storeDetail.contactName,
                      contactPhone: storeDetail.contactPhone,
                      contactEmail: storeDetail.contactEmail,
                    }
                  : undefined
              }
              onSubmit={onStoreSubmit}
            />
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
