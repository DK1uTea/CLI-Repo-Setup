'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { collectLeafKeys, type TPermissionChild } from '../(hooks)/use-role-permissions'
import { PermissionLeafRow } from './permission-leaf-row'

type Props = {
  group: TPermissionChild
  selectedKeys: string[]
  onToggleChild: (key: string) => void
  onToggleGroupKeys: (leafKeys: string[]) => void
}

export function PermissionSubGroupRow({
  group,
  selectedKeys,
  onToggleChild,
  onToggleGroupKeys,
}: Props) {
  const children = Array.isArray(group.children) ? group.children : []
  const leafKeys = collectLeafKeys(group)
  const checkedCount = leafKeys.filter((k) => selectedKeys.includes(k)).length
  const total = leafKeys.length
  const allChecked = total > 0 && checkedCount === total
  const indeterminate = checkedCount > 0 && checkedCount < total

  return (
    <Accordion
      type="single"
      collapsible
      className="gap-0 border-b border-border/50 bg-muted/10 last:border-b-0"
    >
      <AccordionItem value={group.key} className="border-0 shadow-none rounded-none">
        <div className="flex items-center gap-3 pl-9 transition-colors hover:bg-muted/30 has-data-[state=open]:bg-muted/20">
          <Checkbox
            checked={allChecked ? true : indeterminate ? 'indeterminate' : false}
            onCheckedChange={() => onToggleGroupKeys(leafKeys)}
            className="shrink-0"
          />
          <AccordionTrigger className="py-3 pr-4 pl-0 border-b-0 data-[state=open]:border-b-0 **:data-[slot=accordion-trigger-icon]:text-muted-foreground! **:data-[slot=accordion-trigger-icon]:size-4! gap-1">
            <span className="flex-1 text-sm font-medium">{group.name}</span>
          </AccordionTrigger>
        </div>

        <AccordionContent className="p-0 border-t border-border/50">
          {children.map((child) =>
            Array.isArray(child.children) && child.children.length > 0 ? (
              <PermissionSubGroupRow
                key={child.key}
                group={child}
                selectedKeys={selectedKeys}
                onToggleChild={onToggleChild}
                onToggleGroupKeys={onToggleGroupKeys}
              />
            ) : (
              <PermissionLeafRow
                key={child.key}
                child={child}
                selectedKeys={selectedKeys}
                onToggleChild={onToggleChild}
                className="pl-14"
              />
            ),
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
