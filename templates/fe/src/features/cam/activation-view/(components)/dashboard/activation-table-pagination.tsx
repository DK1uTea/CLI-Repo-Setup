'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Pagination } from '@/shared/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'

type Props = {
  page: number
  totalPages: number
  limit: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  variant?: 'numbered' | 'compact'
}

const LIMIT_OPTIONS = [10, 20, 50, 100]

export function ActivationTablePagination({
  page,
  totalPages,
  limit,
  onPageChange,
  onLimitChange,
  variant = 'numbered',
}: Props) {
  const t = useTranslations('activationView')

  return (
    <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-end">
      <Select value={String(limit)} onValueChange={(v) => onLimitChange(Number(v))}>
        <SelectTrigger
          className={cn('h-8 w-full text-sm sm:w-fit', variant === 'compact' && 'rounded-full')}
          translate="no"
          aria-label={t('dashboard.perPageLabel')}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent translate="no">
          <SelectGroup>
            {LIMIT_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={String(opt)}>
                {t('dashboard.perPage', { count: opt })}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        variant={variant}
        className="mx-0 w-full sm:w-auto sm:justify-end"
      />
    </div>
  )
}
