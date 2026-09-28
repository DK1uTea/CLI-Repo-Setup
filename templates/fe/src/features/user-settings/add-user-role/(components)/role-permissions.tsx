'use client'

import { useFormContext, useWatch } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { collectLeafKeys, useRolePermissions, type TPermission } from '../(hooks)/use-role-permissions'
import type { AddRoleFormValues } from '../(helpers)/add-role-schema'
import { PermissionGroupRow } from './permission-group-row'

export function RolePermissions() {
  const t = useTranslations('settings')
  const { setValue, control } = useFormContext<AddRoleFormValues>()
  const { data: permissions, isLoading } = useRolePermissions()
  const selectedKeys = useWatch({ control, name: 'permissions', defaultValue: [] })

  function updateKeys(next: string[]) {
    setValue('permissions', next)
  }

  function handleToggleChild(key: string) {
    const next = selectedKeys.includes(key)
      ? selectedKeys.filter((k) => k !== key)
      : [...selectedKeys, key]
    updateKeys(next)
  }

  function handleToggleGroupKeys(leafKeys: string[]) {
    const allChecked = leafKeys.every((k) => selectedKeys.includes(k))
    const next = allChecked
      ? selectedKeys.filter((k) => !leafKeys.includes(k))
      : [...new Set([...selectedKeys, ...leafKeys])]
    updateKeys(next)
  }

  function handleToggleGroup(permission: TPermission) {
    if (permission.type === 'RADIO') {
      // Deselect the current radio choice
      const childKeys = permission.children.map((c) => c.key)
      updateKeys(selectedKeys.filter((k) => !childKeys.includes(k)))
      return
    }
    // CHECKBOX — toggle every leaf permission under the group (recursively)
    handleToggleGroupKeys(collectLeafKeys(permission))
  }

  function handleRadioChange(groupKey: string, childKey: string) {
    const group = permissions?.find((p) => p.key === groupKey)
    if (!group) return
    // Already selected — no-op to prevent double-fire from RadioGroupItem + span
    if (selectedKeys.includes(childKey)) return
    const childKeys = group.children.map((c) => c.key)
    const next = [...selectedKeys.filter((k) => !childKeys.includes(k)), childKey]
    updateKeys(next)
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-base font-semibold mb-4">{t('permissions')}</h2>
      <div className="flex flex-col gap-3">
        {permissions?.map((permission) => (
          <PermissionGroupRow
            key={permission.key}
            permission={permission}
            selectedKeys={selectedKeys}
            onToggleChild={handleToggleChild}
            onToggleGroup={handleToggleGroup}
            onToggleGroupKeys={handleToggleGroupKeys}
            onRadioChange={handleRadioChange}
          />
        ))}
      </div>
    </div>
  )
}
