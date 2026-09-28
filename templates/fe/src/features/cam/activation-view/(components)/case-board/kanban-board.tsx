'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useGetActivationsGroup } from '../../(hooks)/use-get-activations-group'
import ActivationItemCard from './activation-item-card'
import ActivationItemCardSkeleton from './activation-item-card-skeleton'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  ACTIVATION_BOARD_COLUMNS,
  ACTIVATION_STATUS,
  getActivationStatusTranslationKey,
} from '../../../(helpers)/cam-constants'
import { ComponentGuard } from '@/shared/components/common/component-guard'
import { PERMISSIONS } from '@/shared/constants/permissions'

const SKELETON_CARDS_PER_COLUMN = 3
const DRAFT_ACCESS_PERMISSIONS = [
  PERMISSIONS.CustomerActivation.InternalAdmin,
  PERMISSIONS.CustomerActivation.Sale,
]

const KanbanBoard = () => {
  const t = useTranslations('activationView')
  const { groups, isLoading } = useGetActivationsGroup()

  // Calculate height dynamically with JS
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined)

  useEffect(() => {
    const calculateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const newHeight = viewportHeight - rect.top - 16 // 16px bottom padding

        setContainerHeight(newHeight > 0 ? newHeight : undefined)
      }
    }

    calculateHeight()
    window.addEventListener('resize', calculateHeight)

    return () => {
      window.removeEventListener('resize', calculateHeight)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="overflow-hidden"
      style={{ height: containerHeight ? `${containerHeight}px` : 'auto' }}
    >
      {/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex --
          WCAG 2.1.1 requires a scrollable region to be keyboard-focusable (axe:
          scrollable-region-focusable). jsx-a11y's interactive/non-interactive role split has no
          allowance for this exact technique: "region" is correctly non-interactive, yet still
          needs tabIndex + a scroll key handler to satisfy the WCAG success criterion. */}
      <div
        role="region"
        data-testid="cam-intake-board"
        className="flex gap-3 overflow-x-auto _custom-scroll-x h-full items-stretch pb-2"
        aria-label={t('boardScrollRegion')}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') e.currentTarget.scrollBy({ left: 200, behavior: 'smooth' })
          if (e.key === 'ArrowLeft') e.currentTarget.scrollBy({ left: -200, behavior: 'smooth' })
        }}
      >
        {ACTIVATION_BOARD_COLUMNS.map((column) => {
          const group = groups.find((g) => g.status === column)
          const items = group?.items ?? []
          const translationKey = getActivationStatusTranslationKey(column) ?? 'status.statusDraft'

          const columnContent = (
            <div
              key={column}
              data-testid={`cam-intake-column-${column.toLowerCase()}`}
              className="flex w-70 shrink-0 flex-col gap-3 rounded-xl bg-muted/40 p-3 border border-border/50 h-full min-h-0 overflow-hidden"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-gray-500" />
                  <h4 className="font-semibold text-sm text-foreground">
                    {t(translationKey)}
                  </h4>
                </div>
                {isLoading ? (
                  <Skeleton className="h-5 w-6 rounded-full" />
                ) : (
                <span
                  data-testid="cam-intake-column-count"
                  className="rounded-full bg-card px-2 py-0.5 text-xs text-muted-foreground border border-border/50"
                >
                    {items.length}
                  </span>
                )}
              </div>

              {/* Column Content Area */}
              <div
                data-testid="cam-intake-column-body"
                className="flex flex-1 flex-col gap-2 min-h-0 overflow-y-auto _custom-scroll rounded-xl"
              >
                {isLoading
                  ? Array.from({ length: SKELETON_CARDS_PER_COLUMN }).map((_, index) => (
                    <ActivationItemCardSkeleton key={index} />
                  ))
                  : items.map((item) => (
                    <ActivationItemCard key={item.id} item={item} />
                  ))}
              </div>
            </div>
          )

          if (column === ACTIVATION_STATUS.DRAFT) {
            return (
              <ComponentGuard key={column} requiredKeys={DRAFT_ACCESS_PERMISSIONS}>
                {columnContent}
              </ComponentGuard>
            )
          }

          return columnContent
        })}
      </div>
      {/* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
    </div>
  )
}

export default KanbanBoard
