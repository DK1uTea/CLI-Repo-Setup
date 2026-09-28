'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { ArrowLeftIcon } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

type Props = { mode: 'create' | 'update' }

export function ActivationFormHeader({ mode }: Props) {
  const t = useTranslations('activationForm')
  const router = useRouter()

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        className="shrink-0 w-11 h-11 rounded-xl bg-input/40 border border-boder"
        onClick={() => router.back()}
        aria-label={t('back')}
      >
        <ArrowLeftIcon className="size-5 text-primary" />
      </Button>
      <h1 className="text-2xl font-medium text-foreground">
        {mode === 'create' ? t('titleCreate') : t('titleUpdate')}
      </h1>
    </div>
  )
}
