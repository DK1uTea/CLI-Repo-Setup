'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/shared/components/ui/button'
import { STORE_FORM_ID } from './steps/step-store/step-store'
import { ACTIVATION_STEP2_FORM_ID } from './steps/step-activation/step-activation'
import type { StoreTabMode } from '../(hooks)/use-store-tab'

type Props = {
  mode: 'create' | 'update'
  step: number
  storeTabMode: StoreTabMode
  isCreatingStore: boolean
  isUpdatingStore: boolean
  isSubmittingActivation: boolean
  onCancel: () => void
}

export function ActivationFormFooter({
  mode,
  step,
  storeTabMode,
  isCreatingStore,
  isUpdatingStore,
  isSubmittingActivation,
  onCancel,
}: Props) {
  const t = useTranslations('activationForm')
  const isFormTab = storeTabMode === 'new' || storeTabMode === 'edit'
  const isSubmitting =
    isCreatingStore || isUpdatingStore || isSubmittingActivation

  return (
    <div className="sticky bottom-0 z-10 -mx-6 border-y border-border bg-card">
      <div className="flex items-center justify-end gap-3 p-4">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          {t('cancel')}
        </Button>

        {isFormTab ? (
          <>
            {storeTabMode === 'edit' && (
              <Button
                type="submit"
                form={STORE_FORM_ID}
                variant="outline-primary"
                isLoading={isUpdatingStore}
                disabled={isUpdatingStore}
              >
                {t('saveExistingStore')}
              </Button>
            )}
            {storeTabMode === 'new' && (
              <Button
                type="submit"
                form={STORE_FORM_ID}
                isLoading={isCreatingStore}
                disabled={isCreatingStore}
              >
                {t('addNewStore')}
              </Button>
            )}
          </>
        ) : step === 2 ? (
          <Button
            type="submit"
            form={ACTIVATION_STEP2_FORM_ID}
            isLoading={isSubmittingActivation}
            disabled={isSubmittingActivation}
          >
            {t(mode === 'update' ? 'saveChanges' : 'submitActivation')}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
