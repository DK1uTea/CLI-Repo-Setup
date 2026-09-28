'use client'

import { SearchFilterBar } from "@/shared/components/common/search-filter-bar";
import { useTranslations } from "next-intl";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

const RentalOrdersSearchFilter = () => {
  const t = useTranslations('rent')
  const [filters, setFilters] = useQueryStates({
    status: parseAsString.withDefault(''),
    sort: parseAsString.withDefault(''),
    page: parseAsInteger.withDefault(1),
  })

  const statusOptions = [
    { value: 'ALL', label: t('rentOrders.statusAll') },
    { value: 'pending', label: t('rentOrders.statusPending') },
    { value: 'processing', label: t('rentOrders.statusProcessing') },
    { value: 'complete', label: t('rentOrders.statusCompleted') },
    { value: 'holded', label: t('rentOrders.statusOnHold') },
    { value: 'canceled', label: t('rentOrders.statusCanceled') },
  ]

  const sortOptions = [
    { value: 'created_at_desc', label: t('rentOrders.sortNewest') },
    { value: 'created_at_asc', label: t('rentOrders.sortOldest') },
    { value: 'entity_id_asc', label: t('rentOrders.sortOrderIdAscending') },
    { value: 'entity_id_desc', label: t('rentOrders.sortOrderIdDescending') },
  ]

  return (
    <div className="flex gap-2.5">
      <SearchFilterBar
        placeholder={t('searchPlaceholder')}
        searchKey="search"
        filters={[
          {
            name: 'sort',
            triggerLabel: t('rentOrders.sortTriggerLabel'),
            options: sortOptions,
            value: filters.sort || 'created_at_desc',
            onChange: (v) => setFilters({ sort: v === 'created_at_desc' ? null : v, page: 1 }),
          },
          {
            name: 'status',
            triggerLabel: t('rentOrders.statusTriggerLabel'),
            options: statusOptions,
            value: filters.status || 'ALL',
            onChange: (v) => setFilters({ status: v === 'ALL' ? null : v, page: 1 }),
          },
        ]}
        dateRangeFilter={
          {
            isShow: true,
            dateRangePlaceholder: t('dateRange'),
            dateRangeKey: { fromKey: 'from', toKey: 'to' },
          }
        }
      />
    </div>
  );
}

export default RentalOrdersSearchFilter
