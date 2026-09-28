'use client'

import { useTranslations } from 'next-intl'
import { PencilIcon } from 'lucide-react'
import { OptionMenu } from '@/shared/components/ui/option-menu'
import { cn } from '@/lib/utils'

export type Store = {
  id: string
  name: string
  address: string
}

type Props = {
  store: Store
  isSelected: boolean
  onSelect: (id: string) => void
  onEdit: (id: string) => void
}

export function StoreListItem({ store, isSelected, onSelect, onEdit }: Props) {
  const t = useTranslations('activationForm.store')

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'group flex items-center justify-between px-4 py-4 rounded-xl border cursor-pointer transition-colors',
        isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-muted/40',
      )}
      onClick={() => onSelect(store.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(store.id)
        }
      }}
    >
      <div className="flex flex-col gap-0.5">
        <p className="font-semibold text-sm text-foreground transition-colors group-hover:text-primary">{store.name}</p>
        <p className="text-sm text-muted-foreground">{store.address}</p>
      </div>

      <OptionMenu
        triggerClassName="shrink-0"
        items={[
          {
            key: 'edit',
            label: t('editStore'),
            icon: <PencilIcon className="size-4" />,
            onClick: () => onEdit(store.id),
          },
        ]}
      />
    </div>
  )
}
