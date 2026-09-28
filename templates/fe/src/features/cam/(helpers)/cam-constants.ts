import type { StatusVariant } from '@/shared/components/ui/status-badge'

export const ACTIVATION_STATUS = {
  DRAFT: 'DRAFT',
  READY: 'READY',
  REVIEW: 'REVIEW',
  CLARIFICATION: 'CLARIFICATION',
  APPROVED: 'APPROVED',
  IN_PROGRESS: 'IN_PROGRESS',
  INSTALLATION: 'INSTALLATION',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

export type ActivationStatus = (typeof ACTIVATION_STATUS)[keyof typeof ACTIVATION_STATUS]

// Kanban board column order — CANCELLED is intentionally hidden, no column for it yet.
export const ACTIVATION_BOARD_COLUMNS: ActivationStatus[] = [
  ACTIVATION_STATUS.DRAFT,
  ACTIVATION_STATUS.READY,
  ACTIVATION_STATUS.REVIEW,
  ACTIVATION_STATUS.CLARIFICATION,
  ACTIVATION_STATUS.APPROVED,
  ACTIVATION_STATUS.IN_PROGRESS,
  ACTIVATION_STATUS.INSTALLATION,
  ACTIVATION_STATUS.COMPLETED,
]

// Full sequential "move to next status" graph — used by the kanban card's quick-action menu,
// which lets an admin advance a card one step at a time, including REVIEW -> APPROVED.
export const ACTIVATION_NEXT_STATUS: Partial<Record<ActivationStatus, ActivationStatus>> = {
  DRAFT: ACTIVATION_STATUS.READY,
  READY: ACTIVATION_STATUS.REVIEW,
  REVIEW: ACTIVATION_STATUS.APPROVED,
  APPROVED: ACTIVATION_STATUS.IN_PROGRESS,
  IN_PROGRESS: ACTIVATION_STATUS.INSTALLATION,
  INSTALLATION: ACTIVATION_STATUS.COMPLETED,
}

type MoveToLabelKey = 'moveToReady' | 'moveToReview' | 'moveToInProgress' | 'moveToInstallation' | 'moveToCompleted'

// Same graph, but WITHOUT REVIEW -> APPROVED — used by the admin dashboard's table/card "quick
// advance" menu, which intentionally excludes that step: leaving REVIEW must go through the
// scoring/approval flow (see activation-detail-footer.tsx), not a one-click bump.
export const ACTIVATION_QUICK_ADVANCE_STATUS: Partial<
  Record<ActivationStatus, { status: ActivationStatus; labelKey: MoveToLabelKey }>
> = {
  DRAFT: { status: ACTIVATION_STATUS.READY, labelKey: 'moveToReady' },
  READY: { status: ACTIVATION_STATUS.REVIEW, labelKey: 'moveToReview' },
  APPROVED: { status: ACTIVATION_STATUS.IN_PROGRESS, labelKey: 'moveToInProgress' },
  IN_PROGRESS: { status: ACTIVATION_STATUS.INSTALLATION, labelKey: 'moveToInstallation' },
  INSTALLATION: { status: ACTIVATION_STATUS.COMPLETED, labelKey: 'moveToCompleted' },
}

// Statuses where scoring/evaluation is locked to read-only.
// Typed as string[] (not ActivationStatus[]) so it can be checked against loosely-typed
// `status: string` fields from API responses without a cast at every call site.
export const ACTIVATION_READ_ONLY_STATUSES: string[] = [
  ACTIVATION_STATUS.APPROVED,
  ACTIVATION_STATUS.IN_PROGRESS,
  ACTIVATION_STATUS.INSTALLATION,
  ACTIVATION_STATUS.COMPLETED,
]

// next-intl key per status. A switch (not a Record<string, string>) so TS infers a literal
// return type per branch — required for the result to satisfy next-intl's typed t() calls.
export function getActivationStatusTranslationKey(status: string) {
  switch (status) {
    case ACTIVATION_STATUS.DRAFT: return 'status.statusDraft' as const
    case ACTIVATION_STATUS.READY: return 'status.statusReady' as const
    case ACTIVATION_STATUS.REVIEW: return 'status.statusReview' as const
    case ACTIVATION_STATUS.CLARIFICATION: return 'status.statusClarification' as const
    case ACTIVATION_STATUS.APPROVED: return 'status.statusApproved' as const
    case ACTIVATION_STATUS.IN_PROGRESS: return 'status.statusInProgress' as const
    case ACTIVATION_STATUS.INSTALLATION: return 'status.statusInstallation' as const
    case ACTIVATION_STATUS.COMPLETED: return 'status.statusCompleted' as const
    case ACTIVATION_STATUS.CANCELLED: return 'status.statusCancelled' as const
    default: return null
  }
}

// StatusBadge (shared UI primitive) variant per status.
export function getActivationStatusVariant(status: string): StatusVariant {
  switch (status) {
    case ACTIVATION_STATUS.DRAFT: return 'draft'
    case ACTIVATION_STATUS.READY: return 'ready'
    case ACTIVATION_STATUS.REVIEW: return 'review'
    case ACTIVATION_STATUS.CLARIFICATION: return 'clarification'
    case ACTIVATION_STATUS.APPROVED: return 'approved'
    case ACTIVATION_STATUS.IN_PROGRESS: return 'in_progress'
    case ACTIVATION_STATUS.INSTALLATION: return 'installation'
    case ACTIVATION_STATUS.COMPLETED: return 'completed'
    case ACTIVATION_STATUS.CANCELLED: return 'cancelled'
    default: return 'draft'
  }
}
