'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { SearchFilterBar } from '@/shared/components/common/search-filter-bar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { ActivationStatusBadge } from '../../../(components)/activation-status-badge'
import { ActivationTablePagination } from './activation-table-pagination'
import { useActivationAdminList } from '../../(hooks)/use-activation-admin-list'
import { useUpdateActivationStatus } from '../../(hooks)/use-update-activation-status'
import { ActivationAdminCard } from './activation-admin-card'
import type { ActivationItem } from '../../(hooks)/use-activation-admin-list'
import { Skeleton } from '@/shared/components/ui/skeleton'
import ActivationItemCardActionDropdown from '../case-board/activation-item-card-action-dropdown'
import { formatDate } from '@/lib/date-utils'
import { useDateFormat } from '@/shared/stores/use-user-store'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/components/ui/empty'
import { SearchX } from 'lucide-react'

const BRAND_FIT_LABELS: Record<string, string> = {
  STANDARD: 'Standard',
  SCENE_PREMIUM: 'Scene / Premium',
}

function ScoreBadge({ evaluation }: { evaluation: ActivationItem['evaluation'] }) {
  const score = evaluation?.score ?? 0
  const max = evaluation?.maxScore ?? 27
  const hasScore = evaluation !== null

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${hasScore ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
      {score}/{max}
    </span>
  )
}

export function ActivationCasesTable() {
  const t = useTranslations('activationView')
  const dateFormat = useDateFormat()
  const { items, pagination, isLoading, page, limit, goToPage, setLimit, sortBy, setSortBy } =
    useActivationAdminList()
  const updateStatus = useUpdateActivationStatus()

  const sortOptions = [
    { value: 'BRAND_FIT_ASC', label: t('filter.sortBrandFitAsc') },
    { value: 'BRAND_FIT_DESC', label: t('filter.sortBrandFitDesc') },
    { value: 'NAME_ASC', label: t('filter.sortCaseNameAsc') },
    { value: 'NAME_DESC', label: t('filter.sortCaseNameDesc') },
    { value: 'SCORE_ASC', label: t('filter.sortScoreLowHigh') },
    { value: 'SCORE_DESC', label: t('filter.sortScoreHighLow') },
    { value: 'UPDATED_AT_ASC', label: t('filter.sortLastActivityNearest') },
    { value: 'UPDATED_AT_DESC', label: t('filter.sortLastActivityLatest') },
  ]

  return (
    <div className="space-y-3">
      {/* Search / filter bar */}
      <SearchFilterBar
        searchKey="actSearch"
        placeholder={t('dashboard.searchPlaceholder')}
        inputClassName="flex-1"
        className="w-full"
        filters={[
          {
            name: 'actSort',
            placeholder: t('filter.sortPlaceholder'),
            options: sortOptions,
            value: sortBy,
            onChange: setSortBy,
            showIcon: true,
          },
        ]}
      />

      {!isLoading && items.length === 0 ? (
        <Empty className="rounded-2xl border border-border bg-card py-12">
          <EmptyMedia variant="icon"><SearchX /></EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>{t('dashboard.noCases')}</EmptyTitle>
            <EmptyDescription>{t('dashboard.noCasesDescription')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
        {/* Mobile card list */}
        {!isLoading && (
          <div className="flex flex-col gap-3 md:hidden">
            {items.map((item) => (
              <ActivationAdminCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Desktop table */}
        <div className="hidden md:block rounded-2xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="h-14 bg-muted/60 hover:bg-muted/60">
                <TableHead className="font-semibold text-foreground">{t('dashboard.colCases')}</TableHead>
                <TableHead className="font-semibold text-foreground">{t('dashboard.colOwner')}</TableHead>
                <TableHead className="font-semibold text-foreground">{t('dashboard.colBrandFit')}</TableHead>
                <TableHead className="font-semibold text-foreground">{t('dashboard.colScore')}</TableHead>
                <TableHead className="font-semibold text-foreground">{t('dashboard.colStatus')}</TableHead>
                <TableHead className="font-semibold text-foreground">{t('dashboard.colLastActivity')}</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-12" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
                : items.map((item) => (
                  <TableRow key={item.id} className="h-14">
                    <TableCell className="font-medium text-foreground">
                      <Link
                        href={`/customer-activation/${item.id}`}
                        className="w-full block"
                      >
                        {item.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.owner}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {BRAND_FIT_LABELS[item.brandFit] ?? item.brandFit}
                    </TableCell>
                    <TableCell>
                      <ScoreBadge evaluation={item.evaluation} />
                    </TableCell>
                    <TableCell>
                      <ActivationStatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.updatedAt ? formatDate(item.updatedAt, dateFormat) : '—'}
                    </TableCell>
                    <TableCell>
                      <ActivationItemCardActionDropdown
                        activationId={item.id}
                        status={item.status}
                        activeTab="dashboard"
                        isUpdating={updateStatus.isPending}
                        onMoveToNextStatus={(nextStatus) =>
                          updateStatus.mutate({ id: item.id, status: nextStatus })
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
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
        </>
      )}
    </div>
  )
}
