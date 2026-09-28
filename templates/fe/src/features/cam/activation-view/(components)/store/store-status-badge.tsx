import { StatusBadge, type StatusVariant } from '@/shared/components/ui/status-badge'

type Props = { status: string }

const STATUS_CONFIG: Record<string, { label: string; variant: StatusVariant }> = {
  ACTIVE: {
    label: 'Active',
    variant: 'approved',
  },
  INACTIVE: {
    label: 'Disabled',
    variant: 'draft',
  },
}

export function StoreStatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.INACTIVE

  return <StatusBadge variant={config.variant}>{config.label}</StatusBadge>
}
