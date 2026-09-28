'use client'

import { useTranslations } from 'next-intl'
import { UploadDropzone, type ImageFile } from '@/shared/components/ui/upload-dropzone'

type Props = {
  value: ImageFile[]
  onChange: (files: ImageFile[]) => void
}

export function ActivationMediaUpload({ value, onChange }: Props) {
  const t = useTranslations('activationForm')

  return (
    <UploadDropzone
      value={value}
      maxSizeBytes={10 * 1024 * 1024}
      maxFiles={20}
      dropText={t('step2.uploadDropText')}
      browseText={t('step2.uploadBrowseText')}
      hintText={t('step2.uploadHintText')}
      errorTooLargeText={t('step2.uploadErrorTooLarge')}
      errorInvalidTypeText={t('step2.uploadErrorInvalidType')}
      onChange={onChange}
    />
  )
}
