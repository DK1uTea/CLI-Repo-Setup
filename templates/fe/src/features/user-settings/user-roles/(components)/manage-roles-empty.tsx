import { useTranslations } from 'next-intl'
import { ShieldIcon } from 'lucide-react'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/shared/components/ui/empty'

export function ManageRolesEmpty() {
  const t = useTranslations('settings')

  return (
    <Empty className="py-16">
      <EmptyMedia>
        <ShieldIcon className="size-24 text-primary opacity-40" />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>{t('noRoles')}</EmptyTitle>
        <EmptyDescription>{t('noRolesDescription')}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
