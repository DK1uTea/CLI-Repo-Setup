'use client'

import { ArrowUpDownIcon } from 'lucide-react'
import type { SortField } from '../(hooks)/use-roles-access'

type Props = {
  field: SortField
  sortField: SortField | null
  sortDir: 'asc' | 'desc'
}

export function SortIcon({ field, sortField, sortDir }: Props) {
  if (sortField !== field)
    return <ArrowUpDownIcon className="size-3.5 ml-1 text-muted-foreground" />
  return (
    <ArrowUpDownIcon
      className={`size-3.5 ml-1 text-primary ${sortDir === 'desc' ? 'rotate-180' : ''}`}
    />
  )
}
