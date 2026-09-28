'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group'
import { collectLeafKeys, type TPermission } from '../(hooks)/use-role-permissions'
import { PermissionLeafRow } from './permission-leaf-row'
import { PermissionSubGroupRow } from './permission-subgroup-row'

type Props = {
  permission: TPermission
  selectedKeys: string[]
  onToggleChild: (key: string) => void
  onToggleGroup: (permission: TPermission) => void
  onToggleGroupKeys: (leafKeys: string[]) => void
  onRadioChange: (groupKey: string, childKey: string) => void
}

export function PermissionGroupRow({
  permission,
  selectedKeys,
  onToggleChild,
  onToggleGroup,
  onToggleGroupKeys,
  onRadioChange,
}: Props) {
  const childKeys = permission.children.map((c) => c.key)
  const leafKeys = collectLeafKeys(permission)
  const checkedCount =
    permission.type === 'CHECKBOX'
      ? leafKeys.filter((k) => selectedKeys.includes(k)).length
      : selectedKeys.some((k) => childKeys.includes(k))
        ? 1
        : 0
  const total = permission.type === 'CHECKBOX' ? leafKeys.length : childKeys.length
  const allChecked = permission.type === 'CHECKBOX' && checkedCount === total && total > 0
  const indeterminate = permission.type === 'CHECKBOX' && checkedCount > 0 && checkedCount < total
  const radioValue =
    permission.type === 'RADIO' ? (selectedKeys.find((k) => childKeys.includes(k)) ?? '') : ''

  return (
    <Accordion type="single" collapsible className="gap-0">
      <AccordionItem value={permission.key} className="rounded-lg border border-border bg-transparent shadow-none">
        <div className="flex items-center gap-3 pl-4 transition-colors hover:bg-muted/50 has-data-[state=open]:bg-muted/30">
          <Checkbox
            checked={
              permission.type === 'CHECKBOX'
                ? allChecked
                  ? true
                  : indeterminate
                    ? 'indeterminate'
                    : false
                : checkedCount > 0
            }
            onCheckedChange={() => onToggleGroup(permission)}
            className="shrink-0"
          />

          <AccordionTrigger className="py-4 pr-4 pl-0 border-b-0 data-[state=open]:border-b-0 **:data-[slot=accordion-trigger-icon]:text-muted-foreground! **:data-[slot=accordion-trigger-icon]:size-4! gap-1">
            <span className="flex-1 text-sm font-semibold">{permission.name}</span>
          </AccordionTrigger>
        </div>

        <AccordionContent className="p-0 border-t border-border">
          {permission.type === 'CHECKBOX' ? (
            permission.children.map((child) =>
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
                  className="pl-9"
                />
              ),
            )
          ) : (
            // RadioGroup value controls visual state only — no onValueChange to avoid Radix re-fire loop
            <RadioGroup value={radioValue} className="gap-0">
              {permission.children.map((child) => (
                <div
                  key={child.key}
                  className="flex items-center gap-3 border-b border-border/50 bg-muted/10 pl-9 pr-4 last:border-b-0 hover:bg-muted/30 transition-colors"
                >
                  <RadioGroupItem
                    id={child.key}
                    value={child.key}
                    onClick={() => onRadioChange(permission.key, child.key)}
                    className="shrink-0 border-2 border-muted-foreground/50"
                  />
                  <span
                    className="flex-1 cursor-pointer select-none text-sm text-muted-foreground h-11.25 flex items-center"
                    onClick={() => onRadioChange(permission.key, child.key)}
                  >
                    {child.name}
                  </span>
                </div>
              ))}
            </RadioGroup>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
