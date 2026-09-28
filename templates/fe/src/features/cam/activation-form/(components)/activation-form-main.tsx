'use client'

import { useEffect } from 'react'
import { parseAsBoolean, parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useRouter } from '@/i18n/navigation'
import { ActivationFormFooter } from './activation-form-footer'
import { ActivationFormHeader } from './activation-form-header'
import { ActivationFormStepIndicator } from './activation-form-step-indicator'
import { ActivationSuccessDialog } from './activation-success-dialog'
import { StepStore } from './steps/step-store/step-store'
import { StepActivation } from './steps/step-activation/step-activation'
import { useStoreTab } from '../(hooks)/use-store-tab'
import { useActivationDetail } from '../../(hooks)/use-activation-detail'
import { useSubmitStepActivation } from '../(hooks)/use-submit-step-activation'
import { useSubmitStepStore } from '../(hooks)/use-submit-step-store'
import { extractKeyFromUrl, getFilename } from '@/lib/file-utils'
import type { ImageFile } from '@/shared/components/ui/upload-dropzone'
import { useUserStore } from '@/shared/stores/use-user-store'
import { PERMISSIONS, PERMISSION_ALL_WILDCARD } from '@/shared/constants/permissions'

type Props = {
  mode: 'create' | 'update'
}

function mapUploadedMedia(path: string): ImageFile {
  return {
    name: getFilename(path),
    preview: path,
    url: path,
    key: extractKeyFromUrl(path),
    isUploaded: true,
  }
}

export function ActivationFormMain({ mode }: Props) {
  const router = useRouter()
  const permissions = useUserStore((state) => state.permissions)
  const [rawStep, setStep] = useQueryState('step', parseAsInteger.withDefault(1))
  const step = rawStep === 2 ? 2 : 1
  const [activationId] = useQueryState('activation_id', parseAsString.withDefault(''))
  const [selectedStoreId, setSelectedStoreId] = useQueryState(
    'storeId',
    parseAsString.withDefault(''),
  )
  const [, setEditFromStep2] = useQueryState(
    'editFromStep2',
    parseAsBoolean.withDefault(false),
  )
  const { mode: storeTabMode, openEditStore } = useStoreTab()
  const storeStep = useSubmitStepStore()
  const activationStep = useSubmitStepActivation({
    mode,
    storeId: selectedStoreId,
  })
  const isAdmin =
    permissions?.includes(PERMISSION_ALL_WILDCARD) ||
    permissions?.includes(PERMISSIONS.CustomerActivation.InternalAdmin)

  function handleBackToDashboard() {
    router.push(isAdmin ? '/customer-activation?tab=dashboard' : '/customer-activation')
  }

  function handleViewActivation() {
    const id = activationStep.submittedActivationId
    if (!id) return

    if (isAdmin) {
      router.push(`/customer-activation/${id}?backTo=${encodeURIComponent('/customer-activation?tab=dashboard')}`)
      return
    }

    router.push(`/customer-activation?activation_drawer=open&activation_id=${id}`)
  }
  const { data: activationDetail, isLoading: isLoadingDetail } = useActivationDetail(activationId || undefined)
  const isStep2Loading =
    mode === 'update' && (isLoadingDetail || !activationDetail)
  const canRenderStep2 =
    mode !== 'update' || (!isLoadingDetail && !!activationDetail)
  const activationInitialData = activationDetail && {
    name: activationDetail.name,
    responsible: activationDetail.responsibleCam,
    numberOfOutlets: activationDetail.numberOfOutlets,
    outletNotes: activationDetail.outletNotes,
    highTrafficZones: activationDetail.highTrafficZones,
    highTrafficZoneNotes: activationDetail.highTrafficZoneNotes,
    targetGroups: activationDetail.targetGroups,
    targetGroupNotes: activationDetail.targetGroupNotes,
    salesConcepts: activationDetail.salesConcepts,
    salesConceptNotes: activationDetail.salesConceptNotes,
    contractSituations: activationDetail.contractSituations,
    contractSituationNotes: activationDetail.contractSituationNotes,
    revenuePotentials: activationDetail.revenuePotentials,
    ahMarket: activationDetail.ahMarket,
    ahMarketMediaUrls: activationDetail.ahMarketMediaUrls.map(({ path }) => mapUploadedMedia(path)),
    aMarket: activationDetail.aMarket,
    aMarketNotes: activationDetail.aMarketNotes,
    aMarketMediaUrls: activationDetail.aMarketMediaUrls.map(({ path }) => mapUploadedMedia(path)),
    brandFit: activationDetail.brandFit,
    brandFitNotes: activationDetail.brandFitNotes,
    profitability: activationDetail.profitability,
  }

  function handleSelectStore(id: string) {
    setSelectedStoreId(id)
    setStep(2)
  }

  useEffect(() => {
    if (activationDetail?.store?.id) {
      setSelectedStoreId(activationDetail.store.id)
      setStep(2)
    }
  }, [activationDetail])

  return (
    <div className="space-y-5">
      <div className="max-w-3xl mx-auto rounded-3xl border border-border bg-card overflow-hidden p-4 space-y-6 md:space-y-8">
        <ActivationFormHeader mode={mode} />
        <ActivationFormStepIndicator step={step} />
      </div>

      <div className="max-w-3xl mx-auto">
        {step === 1 && isLoadingDetail && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          </div>
        )}
        {step === 1 && !isLoadingDetail && (
          <StepStore
            selectedStoreId={selectedStoreId}
            onSelectStore={handleSelectStore}
            onStoreSubmit={storeStep.submit}
          />
        )}
        {step === 2 && isStep2Loading && (
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        )}
        {step === 2 && canRenderStep2 && (
          <StepActivation
            storeId={selectedStoreId || activationDetail?.store?.id || ''}
            onEditStore={() => {
              setEditFromStep2(true)
              openEditStore(selectedStoreId)
              setStep(1)
            }}
            onSubmit={activationStep.submit}
            initialData={activationInitialData}
          />
        )}
      </div>

      <ActivationFormFooter
        mode={mode}
        step={step}
        storeTabMode={storeTabMode}
        isCreatingStore={storeStep.isCreating}
        isUpdatingStore={storeStep.isUpdating}
        isSubmittingActivation={activationStep.isSubmitting}
        onCancel={() => router.back()}
      />

      <ActivationSuccessDialog
        open={!!activationStep.submittedActivationId}
        mode={mode}
        onBackToDashboard={handleBackToDashboard}
        onViewActivation={handleViewActivation}
      />
    </div>
  )
}
