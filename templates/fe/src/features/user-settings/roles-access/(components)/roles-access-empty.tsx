import { useTranslations } from 'next-intl'
import { UsersIcon } from 'lucide-react'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/shared/components/ui/empty'

export function RolesAccessEmpty() {
  const t = useTranslations('settings')

  return (
    <Empty className="py-16">
      <EmptyMedia>
        <UsersIcon className="size-24 text-primary opacity-40" />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>{t('noUsers')}</EmptyTitle>
        <EmptyDescription>{t('noUsersDescription')}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
