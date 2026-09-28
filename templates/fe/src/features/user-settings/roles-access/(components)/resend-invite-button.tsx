'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { nowUtc } from '@/lib/date-utils'
import { Button } from '@/shared/components/ui/button'

type Props = {
  expiresAt: number
  onClick: () => void
}

function getRemainingSeconds(expiresAt: number) {
  if (!expiresAt) return 0
  const remaining = Math.ceil((expiresAt - nowUtc().getTime()) / 1000)
  return remaining > 0 ? remaining : 0
}

export function ResendInviteButton({ expiresAt, onClick }: Props) {
  const t = useTranslations('settings')
  const [remaining, setRemaining] = useState(() => getRemainingSeconds(expiresAt))

  useEffect(() => {
    setRemaining(getRemainingSeconds(expiresAt))
    if (getRemainingSeconds(expiresAt) <= 0) return
    const timer = setInterval(() => {
      setRemaining(getRemainingSeconds(expiresAt))
    }, 1000)
    return () => clearInterval(timer)
  }, [expiresAt])

  return (
    <Button
      type="button"
      variant="link"
      onClick={onClick}
      disabled={remaining > 0}
      className="h-auto p-0 text-xs text-muted-foreground/85 underline hover:text-muted-foreground disabled:cursor-not-allowed disabled:text-muted-foreground"
    >
      {remaining > 0 ? t('resendInviteCountdown', { seconds: remaining }) : t('resendInvite')}
    </Button>
  )
}
