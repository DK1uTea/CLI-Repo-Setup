'use client'

import { useTranslations } from 'next-intl'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/ui/table'
import { SearchFilterBar } from '@/shared/components/common/search-filter-bar'
import { ActivationStatusBadge } from '../../../(components)/activation-status-badge'
import EvaluationBadge from '../../../(components)/evaluation-badge'
import { ActivationTablePagination } from '../dashboard/activation-table-pagination'
import { useAdminStoreActivations } from '../../(hooks)/use-admin-store-activations'
import type { StoreActivationItem } from '../../(hooks)/use-admin-store-activations'
import { formatDate } from '@/lib/date-utils'
import { useDateFormat } from '@/shared/stores/use-user-store'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/shared/components/ui/empty'
import { FolderOpenIcon } from 'lucide-react'

function getOwnerName(owner: StoreActivationItem['owner']): string {
  if (!owner) return '—'
  if (typeof owner === 'string') return owner
  return owner.name ?? owner.fullName ?? '—'
}

type Props = { storeId: string }

export function StoreActivationsTable({ storeId }: Props) {
  const t = useTranslations('activationView')
  const dateFormat = useDateFormat()
  const { items, pagination, isLoading, page, limit, sortBy, goToPage, setLimit, setSortBy } =
    useAdminStoreActivations(storeId)

  const sortOptions = [
    { value: 'NAME_ASC', label: t('filter.sortCaseNameAsc') },
    { value: 'NAME_DESC', label: t('filter.sortCaseNameDesc') },
    { value: 'SCORE_ASC', label: t('filter.sortScoreLowHigh') },
    { value: 'SCORE_DESC', label: t('filter.sortScoreHighLow') },
    { value: 'UPDATED_AT_ASC', label: t('filter.sortLastActivityNearest') },
    { value: 'UPDATED_AT_DESC', label: t('filter.sortLastActivityLatest') },
  ]

  return (
    <div className="space-y-3">
      <SearchFilterBar
        searchKey="storeActSearch"
        placeholder={t('store.casesSearchPlaceholder')}
        inputClassName="flex-1"
        className="w-full"
        filters={[
          {
            name: 'storeActSort',
            placeholder: t('filter.sortPlaceholder'),
            options: sortOptions,
            value: sortBy,
            onChange: setSortBy,
            showIcon: true,
          },
        ]}
      />

      {!isLoading && items.length === 0 ? (
        <Empty className="py-12">
          <EmptyMedia>
            <FolderOpenIcon className="size-12 text-primary opacity-40" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>{t('store.noCases')}</EmptyTitle>
            <EmptyDescription>{t('store.noCasesDescription')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60 hover:bg-muted/60">
                <TableHead className="font-semibold text-foreground">{t('store.colCases')}</TableHead>
                <TableHead className="font-semibold text-foreground">{t('store.colOwner')}</TableHead>
                <TableHead className="font-semibold text-foreground">{t('store.colScore')}</TableHead>
                <TableHead className="font-semibold text-foreground">{t('dashboard.colStatus')}</TableHead>
                <TableHead className="font-semibold text-foreground">{t('dashboard.colLastActivity')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j}><Skeleton className="h-12" /></TableCell>
                    ))}
                  </TableRow>
                ))
                : items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">{getOwnerName(item.owner)}</TableCell>
                    <TableCell>
                      <EvaluationBadge evaluation={item.evaluation} />
                    </TableCell>
                    <TableCell><ActivationStatusBadge status={item.status} /></TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.updatedAt ? formatDate(item.updatedAt, dateFormat) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}

      {pagination && (
        <ActivationTablePagination
          page={page}
          totalPages={pagination.totalPages}
          limit={limit}
          onPageChange={goToPage}
          onLimitChange={setLimit}
          variant="compact"
        />
      )}
    </div>
  )
}
