'use client'

import { Fragment, useState } from 'react'
import { useTranslations } from 'next-intl'
import { CheckIcon, XIcon, ChevronDownIcon } from 'lucide-react'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/shared/components/ui/table'
import { cn } from '@/lib/utils'
import { PERMISSIONS_TREE } from '@/shared/constants/permissions'
import type {
  TMatrixPermissionGroup,
  TMatrixRole,
} from '../(hooks)/use-matrix-permission'

type Props = {
  permissions: TMatrixPermissionGroup[]
  roles: TMatrixRole[]
  selectedRoleId: string | null
  onRoleChange: (roleId: string) => void
}

/** Flat key → human-readable name from our local permissions tree (used as fallback when BE doesn't provide a name) */
const LOCAL_PERMISSION_NAME_MAP: Record<string, string> = Object.fromEntries(
  PERMISSIONS_TREE.flatMap((group) => [
    [group.key, group.name],
    ...group.children.map((child) => [child.key, child.name]),
  ])
)

type MatrixChild = { key: string; children?: MatrixChild[] }

function collectLeafKeys(children: MatrixChild[]): string[] {
  return children.flatMap((c) =>
    c.children?.length ? collectLeafKeys(c.children) : [c.key],
  )
}

function getPermissionLabel(key: string): string {
  return LOCAL_PERMISSION_NAME_MAP[key] ?? key
}

function hasPermission(rolePermissions: string[], key: string): boolean {
  return rolePermissions.includes('*') || rolePermissions.includes(key)
}

export function InviteUserMatrix({ permissions, roles, selectedRoleId, onRoleChange }: Props) {
  const t = useTranslations('settings')
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  function toggleModule(key: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="rounded-xl border border-border overflow-x-auto _custom-scroll-x">
      <Table>
        <TableHeader>
          <TableRow className="border-b bg-muted hover:bg-muted">
            <TableHead className="w-36 min-w-36 max-w-36 sm:w-52 sm:min-w-52 sm:max-w-52 sticky left-0 z-10 bg-muted font-semibold text-foreground">
              {t('permissions')}
            </TableHead>
            {roles.map((role) => {
              const isSelected = selectedRoleId === role.id
              return (
                <TableHead
                  key={role.id}
                  className="min-w-28 sm:min-w-36 cursor-pointer select-none h-14"
                  role="button"
                  tabIndex={0}
                  onClick={() => onRoleChange(role.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRoleChange(role.id) }
                  }}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span className={cn(
                      'flex shrink-0 size-4 rounded-full border-2 items-center justify-center transition-colors',
                      isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/60',
                    )}>
                      {isSelected && <span className="size-1.5 rounded-full bg-primary-foreground" />}
                    </span>
                    <span className={cn(
                      'text-sm font-medium whitespace-nowrap text-left',
                      isSelected ? 'text-primary' : 'text-foreground',
                    )}>
                      {role.name}
                    </span>
                  </div>
                </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissions.map((group) => {
            const isExpanded = expandedModules.has(group.key)
            const leafKeys = collectLeafKeys(group.children)

            return (
              <Fragment key={group.key}>
                <TableRow
                  className="bg-muted/20 cursor-pointer hover:bg-muted/30"
                  onClick={() => toggleModule(group.key)}
                >
                  <TableCell className="w-36 min-w-36 max-w-36 sm:w-52 sm:min-w-52 sm:max-w-52 sticky left-0 z-10 bg-card font-semibold text-sm text-foreground py-4">
                    <div className="flex items-center gap-2">
                      <ChevronDownIcon className={cn('size-4 shrink-0 transition-transform text-muted-foreground', isExpanded && 'rotate-180')} />
                      <span className="truncate">{group.name}</span>
                    </div>
                  </TableCell>
                  {roles.map((role) => {
                    const granted = leafKeys.filter((k) => hasPermission(role.permissions, k)).length
                    return (
                      <TableCell key={role.id} className="text-center text-xs text-muted-foreground py-4">
                        {granted}/{leafKeys.length}
                      </TableCell>
                    )
                  })}
                </TableRow>

                {isExpanded && leafKeys.map((key) => (
                  <TableRow key={key}>
                    <TableCell className="w-36 min-w-36 max-w-36 sm:w-52 sm:min-w-52 sm:max-w-52 sticky left-0 z-10 bg-background pl-9 py-3.5 text-sm text-muted-foreground truncate">
                      {getPermissionLabel(key)}
                    </TableCell>
                    {roles.map((role) => {
                      const isSelected = selectedRoleId === role.id
                      return (
                        <TableCell
                          key={role.id}
                          className={cn('text-center py-3.5 px-4 cursor-pointer', isSelected && 'bg-primary/5')}
                          onClick={() => onRoleChange(role.id)}
                        >
                          {hasPermission(role.permissions, key) ? (
                            <CheckIcon className="size-4 text-emerald-500 mx-auto" />
                          ) : (
                            <XIcon className="size-4 text-destructive mx-auto" />
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </Fragment>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
