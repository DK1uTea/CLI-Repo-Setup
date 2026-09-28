'use client'

import { cn } from '@/lib/utils'
import { Checkbox } from '@/shared/components/ui/checkbox'
import type { TPermissionChild } from '../(hooks)/use-role-permissions'

type Props = {
  child: TPermissionChild
  selectedKeys: string[]
  onToggleChild: (key: string) => void
  className?: string
}

export function PermissionLeafRow({ child, selectedKeys, onToggleChild, className }: Props) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 border-b border-border/50 bg-muted/10 pr-4 last:border-b-0 hover:bg-muted/30 transition-colors',
        className,
      )}
    >
      <Checkbox
        id={child.key}
        checked={selectedKeys.includes(child.key)}
        onCheckedChange={() => onToggleChild(child.key)}
        className="shrink-0"
      />
      <span
        className="flex-1 cursor-pointer select-none text-sm text-muted-foreground h-11.25 flex items-center"
        onClick={() => onToggleChild(child.key)}
      >
        {child.name}
      </span>
    </div>
  )
}
