'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { SearchIcon } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/shared/components/ui/empty'
import { StoreListItem, type Store } from './store-list-item'

type Props = {
  stores: Store[]
  isLoading: boolean
  search: string
  onSearchChange: (value: string) => void
  selectedStoreId: string
  onSelect: (id: string) => void
  onEdit: (id: string) => void
}

const DEBOUNCE_MS = 400

export function StoreList({
  stores,
  isLoading,
  search,
  onSearchChange,
  selectedStoreId,
  onSelect,
  onEdit,
}: Props) {
  const t = useTranslations('activationForm.store')
  const [inputValue, setInputValue] = useState(search)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== search) onSearchChange(inputValue)
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [inputValue])

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          translate="no"
          className="pl-9 bg-card"
          placeholder={t('searchPlaceholder')}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-4 rounded-xl border border-border bg-card">
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="size-8 rounded-md" />
            </div>
          ))}
        </div>
      ) : stores.length === 0 ? (
        <div className="py-16">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>{t('noStores')}</EmptyTitle>
              <EmptyDescription>{t('noStoresDescription')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {stores.map((store) => (
            <StoreListItem
              key={store.id}
              store={store}
              isSelected={selectedStoreId === store.id}
              onSelect={onSelect}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  )
}
