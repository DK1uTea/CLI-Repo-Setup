'use client'

import { parseAsString, useQueryState } from 'nuqs'
import { useState } from 'react'
import { toast } from 'sonner'
import { useCreateActivation } from './use-create-activation'
import { useUpdateActivationRecord } from './use-update-activation-record'
import { useActivationMediaUpload } from './use-activation-media-upload'
import type { ActivationStep2Data } from '../(helpers)/activation-step2-schema'
import type { CreateActivationDto } from '../(services)/activation-service'
import type { UseFormReturn } from 'react-hook-form'
import type { ImageFile } from '@/shared/components/ui/upload-dropzone'
import type { UploadedActivationMedia } from './use-activation-media-upload'

type Props = {
  mode: 'create' | 'update'
  storeId: string
}

function toActivationDto(
  data: ActivationStep2Data,
  storeId: string,
  ahMarketMediaUrls: string[],
  aMarketMediaUrls: string[],
): CreateActivationDto {
  return {
    storeId,
    name: data.name,
    responsibleCam: data.responsible,
    numberOfOutlets: data.numberOfOutlets,
    outletNotes: data.outletNotes,
    highTrafficZones: data.highTrafficZones,
    highTrafficZoneNotes: data.highTrafficZoneNotes,
    targetGroups: data.targetGroups,
    targetGroupNotes: data.targetGroupNotes,
    salesConcepts: data.salesConcepts,
    salesConceptNotes: data.salesConceptNotes,
    contractSituations: data.contractSituations,
    contractSituationNotes: data.contractSituationNotes,
    revenuePotentials: data.revenuePotentials,
    ahMarket: data.ahMarket ?? [],
    ahMarketMediaUrls,
    aMarket: data.aMarket ?? [],
    aMarketNotes: data.aMarketNotes,
    aMarketMediaUrls,
    brandFit: data.brandFit,
    brandFitNotes: data.brandFitNotes,
    profitability: data.profitability,
  }
}

export function useSubmitStepActivation({ mode, storeId }: Props) {
  const [submittedActivationId, setSubmittedActivationId] = useState<string | null>(null)
  const [activationId] = useQueryState(
    'activation_id',
    parseAsString.withDefault(''),
  )
  const createActivation = useCreateActivation()
  const updateActivation = useUpdateActivationRecord()
  const { uploadFiles, isUploading } = useActivationMediaUpload()

  async function submit(data: ActivationStep2Data, form: UseFormReturn<ActivationStep2Data>) {
    const isPendingUpload = (item: ImageFile) => !item.isUploaded && !!item.file
    const ahMarketFiles = data.ahMarketMediaUrls.filter(isPendingUpload).map(({ file }) => file!)
    const aMarketFiles = data.aMarketMediaUrls.filter(isPendingUpload).map(({ file }) => file!)
    let uploadedMedia: Awaited<ReturnType<typeof uploadFiles>>

    try {
      uploadedMedia = await uploadFiles([...ahMarketFiles, ...aMarketFiles])
    } catch {
      toast.error('Upload failed. Please try again.')
      return
    }

    const mergeUploadedMedia = (
      items: ImageFile[],
      uploaded: UploadedActivationMedia[],
    ) => {
      let uploadedIndex = 0
      return items.map((item) => {
        if (!isPendingUpload(item)) return item

        const media = uploaded[uploadedIndex++]
        URL.revokeObjectURL(item.preview)
        return {
          ...item,
          file: undefined,
          preview: media.cdnUrl,
          url: media.cdnUrl,
          key: media.key,
          isUploaded: true,
        }
      })
    }

    const ahMarketMedia = mergeUploadedMedia(
      data.ahMarketMediaUrls,
      uploadedMedia.slice(0, ahMarketFiles.length),
    )
    const aMarketMedia = mergeUploadedMedia(
      data.aMarketMediaUrls,
      uploadedMedia.slice(ahMarketFiles.length),
    )

    form.setValue('ahMarketMediaUrls', ahMarketMedia, { shouldDirty: true })
    form.setValue('aMarketMediaUrls', aMarketMedia, { shouldDirty: true })

    const ahMarketMediaUrls = ahMarketMedia.flatMap(({ key }) => key ?? [])
    const aMarketMediaUrls = aMarketMedia.flatMap(({ key }) => key ?? [])
    const dto = toActivationDto(
      data,
      storeId,
      ahMarketMediaUrls,
      aMarketMediaUrls,
    )
    if (mode === 'update' && activationId) {
      updateActivation.mutate(
        { id: activationId, dto },
        { onSuccess: () => setSubmittedActivationId(activationId) },
      )
      return
    }

    createActivation.mutate(dto, {
      onSuccess: ({ id }) => setSubmittedActivationId(id),
    })
  }

  return {
    submit,
    submittedActivationId,
    isSubmitting:
      isUploading || createActivation.isPending || updateActivation.isPending,
  }
}
