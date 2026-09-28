'use client'

import { CircleCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'

type Props = {
  open: boolean
  mode: 'create' | 'update'
  onBackToDashboard: () => void
  onViewActivation: () => void
}

export function ActivationSuccessDialog({
  open,
  mode,
  onBackToDashboard,
  onViewActivation,
}: Props) {
  const t = useTranslations('activationForm.successDialog')

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false}>
        <DialogHeader className="items-center text-center h-28 justify-center">
          <CircleCheck className="size-10 text-success" aria-hidden="true" />
          <DialogTitle>{t(mode === 'create' ? 'createdTitle' : 'updatedTitle')}</DialogTitle>
          <DialogDescription>
            {t(mode === 'create' ? 'createdDescription' : 'updatedDescription')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onBackToDashboard}>
            {t('backToDashboard')}
          </Button>
          <Button type="button" onClick={onViewActivation}>
            {t('viewActivation')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
