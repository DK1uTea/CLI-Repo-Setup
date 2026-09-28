'use client'

import { useTranslations } from 'next-intl'
import { PencilIcon } from 'lucide-react'
import { useRouter } from '@/i18n/navigation'
import { OptionMenu } from '@/shared/components/ui/option-menu'
import { ActivationStatusBadge } from '../../../(components)/activation-status-badge'
import { formatDate } from '@/lib/date-utils'
import { useDateFormat } from '@/shared/stores/use-user-store'
import { useUpdateActivationStatus } from '../../(hooks)/use-update-activation-status'
import type { ActivationItem } from '../../(hooks)/use-activation-admin-list'
import { ACTIVATION_QUICK_ADVANCE_STATUS, ACTIVATION_STATUS } from '../../../(helpers)/cam-constants'

const BRAND_FIT_LABELS: Record<string, string> = {
  STANDARD: 'Standard',
  SCENE_PREMIUM: 'Scene / Premium',
}

type Props = { item: ActivationItem }

export function ActivationAdminCard({ item }: Props) {
  const t = useTranslations('activationView')
  const dateFormat = useDateFormat()
  const updateStatus = useUpdateActivationStatus()
  const router = useRouter()

  const next = ACTIVATION_QUICK_ADVANCE_STATUS[item.status as keyof typeof ACTIVATION_QUICK_ADVANCE_STATUS]
  const canEdit = item.status === ACTIVATION_STATUS.DRAFT
  const hasActions = !!next || canEdit

  const score = item.evaluation?.score ?? 0
  const maxScore = item.evaluation?.maxScore ?? 27

  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 cursor-pointer"
      onClick={() => router.push(`/customer-activation/${item.id}`)}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-foreground leading-snug">{item.name}</span>
        {hasActions && (
          <div className="-mt-0.5" onClick={(e) => e.stopPropagation()}>
            <OptionMenu
              triggerClassName="size-7"
              items={[
                {
                  key: 'edit',
                  label: t('dashboard.actionEdit'),
                  icon: <PencilIcon className="size-4" />,
                  href: `/customer-activation/update-activation?activation_id=${item.id}&step=2`,
                  hidden: !canEdit,
                },
                {
                  key: 'move-to-next-status',
                  label: next ? t(`dashboard.${next.labelKey}`) : '',
                  onClick: () => next && updateStatus.mutate({ id: item.id, status: next.status }),
                  disabled: updateStatus.isPending,
                  hidden: !next,
                },
              ]}
            />
          </div>
        )}
      </div>

      {/* Brand fit */}
      <p className="text-sm text-muted-foreground">
        {t('dashboard.colBrandFit')}: <span className="font-medium text-foreground">{BRAND_FIT_LABELS[item.brandFit] ?? item.brandFit}</span>
      </p>

      {/* Status + score */}
      <div className="flex items-center gap-2">
        <ActivationStatusBadge status={item.status} />
        {item.evaluation && (
          <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            {score}/{maxScore}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border text-xs text-muted-foreground">
        <span>
          {t('dashboard.colLastActivity')} {item.updatedAt ? formatDate(item.updatedAt, dateFormat) : '—'}
        </span>
        <span className='text-sm'>{item.owner}</span>
      </div>
    </div>
  )
}
