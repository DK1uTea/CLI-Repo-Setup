'use client'

import { useTranslations } from 'next-intl'
import { StatusBadge } from '@/shared/components/ui/status-badge'
import { getActivationStatusTranslationKey, getActivationStatusVariant } from '../(helpers)/cam-constants'

type Props = {
  status: string
}

export function ActivationStatusBadge({ status }: Props) {
  const t = useTranslations('activationView')
  const variant = getActivationStatusVariant(status)
  const translationKey = getActivationStatusTranslationKey(status)

  return (
    <StatusBadge variant={variant}>
      {translationKey ? t(translationKey) : status}
    </StatusBadge>
  )
}
