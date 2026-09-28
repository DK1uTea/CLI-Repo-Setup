'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/ui/table'
import { SearchFilterBar } from '@/shared/components/common/search-filter-bar'
import { ActivationTablePagination } from '../dashboard/activation-table-pagination'
import { StoreStatusBadge } from './store-status-badge'
import { StoreRowActions } from './store-row-actions'
import { StoreBulkActionBar } from './store-bulk-action-bar'
import { useAdminStoreList } from '../../(hooks)/use-admin-store-list'
import { StoreAdminCard } from './store-admin-card'
import { useBulkAdminStoreActions } from '../../(hooks)/use-admin-store-bulk-actions'
import { formatDate } from '@/lib/date-utils'
import { useDateFormat } from '@/shared/stores/use-user-store'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/shared/components/ui/empty'
import { StoreIcon } from 'lucide-react'

type Props = { onEdit: (id: string) => void }

export function StoreAdminList({ onEdit }: Props) {
  const router = useRouter()
  const t = useTranslations('activationView')
  const dateFormat = useDateFormat()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const { items, pagination, isLoading, page, limit, sortBy, goToPage, setLimit, setSortBy } =
    useAdminStoreList()

  const { bulkActivate, bulkDeactivate, isPending } = useBulkAdminStoreActions(
    () => setSelectedIds(new Set()),
  )

  const pageIds = items.map((i) => i.id)
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id))
  const someSelected = pageIds.some((id) => selectedIds.has(id))

  function toggleAll() {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        pageIds.forEach((id) => next.delete(id))
        return next
      })
    } else {
      setSelectedIds((prev) => new Set([...prev, ...pageIds]))
    }
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const sortOptions = [
    { value: 'STATUS_ASC', label: t('store.sortStatusActiveInactive') },
    { value: 'STATUS_DESC', label: t('store.sortStatusInactiveActive') },
    { value: 'UPDATED_AT_ASC', label: t('store.sortLastActivityNearest') },
    { value: 'UPDATED_AT_DESC', label: t('store.sortLastActivityLatest') },
    { value: 'ACTIVATION_COUNT_ASC', label: t('store.sortActivationCountAsc') },
    { value: 'ACTIVATION_COUNT_DESC', label: t('store.sortActivationCountDesc') },
  ]

  const selectedCount = selectedIds.size

  return (
    <div className="space-y-3">
      <div className="relative">
        <SearchFilterBar
          searchKey="storeAdSearch"
          placeholder={t('store.searchPlaceholder')}
          inputClassName="flex-1"
          className="w-full"
          filters={[
            { name: 'storeAdSort', placeholder: t('store.sortPlaceholder'), options: sortOptions, value: sortBy, onChange: setSortBy, showIcon: true },
          ]}
        />

        {selectedCount > 0 && (
          <div className="absolute inset-0 z-10 flex items-center">
            <StoreBulkActionBar
              selectedCount={selectedCount}
              onEnable={() => bulkActivate([...selectedIds])}
              onDisable={() => bulkDeactivate([...selectedIds])}
              isPending={isPending}
            />
          </div>
        )}
      </div>

      {/* Mobile card list */}
      {!isLoading && (
        <div className="flex flex-col gap-3 md:hidden">
          {items.map((item) => (
            <StoreAdminCard key={item.id} item={item} onEdit={onEdit} />
          ))}
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block rounded-2xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="h-14 bg-muted/60 hover:bg-muted/60">
              <TableHead className="w-50">
                <Checkbox
                  aria-label={t('store.selectAllStores')}
                  checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead className="font-semibold text-foreground">{t('store.colStoreName')}</TableHead>
              <TableHead className="font-semibold text-foreground">{t('store.colOwnerName')}</TableHead>
              <TableHead className="font-semibold text-foreground">{t('store.colAddress')}</TableHead>
              <TableHead className="font-semibold text-foreground">{t('store.colStatus')}</TableHead>
              <TableHead className="font-semibold text-foreground">{t('store.colCasesNumber')}</TableHead>
              <TableHead className="font-semibold text-foreground">{t('store.colLastActivity')}</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isLoading && items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-0">
                  <Empty className="py-12">
                    <EmptyMedia variant="icon"><StoreIcon /></EmptyMedia>
                    <EmptyHeader>
                      <EmptyTitle>{t('store.noStores')}</EmptyTitle>
                      <EmptyDescription>{t('store.noStoresDescription')}</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    <TableCell key={j}><Skeleton className="h-12" /></TableCell>
                  ))}
                </TableRow>
              ))
              : items.map((item) => (
                <TableRow
                  key={item.id}
                  className="h-14"
                  data-state={selectedIds.has(item.id) ? 'selected' : undefined}
                >
                  <TableCell className="w-50">
                    <Checkbox
                      aria-label={t('store.selectStore', { storeName: item.storeName })}
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={() => toggleOne(item.id)}
                    />
                  </TableCell>
                  <TableCell
                    className="font-medium text-foreground cursor-pointer hover:text-muted-foreground"
                    onClick={() => router.push(`/customer-activation/store/${item.id}`)}
                  >
                    {item.storeName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.contactName}</TableCell>
                  <TableCell className="text-muted-foreground">{item.storeAddress}</TableCell>
                  <TableCell><StoreStatusBadge status={item.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{item.activationCount}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.updatedAt ? formatDate(item.updatedAt, dateFormat) : '—'}
                  </TableCell>
                  <TableCell>
                    <StoreRowActions
                      storeId={item.id}
                      storeName={item.storeName}
                      status={item.status}
                      onViewDetail={() => router.push(`/customer-activation/store/${item.id}`)}
                      onEdit={() => onEdit(item.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

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
