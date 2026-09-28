'use client'

import { PackageXIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/components/ui/empty'

export default function ProductListEmpty() {
  const t = useTranslations('rent')

  return (
    <Empty>
      <EmptyMedia>
        <PackageXIcon className="size-24 text-primary opacity-40" />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>{t('noProducts')}</EmptyTitle>
        <EmptyDescription>{t('noProductsDescription')}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}