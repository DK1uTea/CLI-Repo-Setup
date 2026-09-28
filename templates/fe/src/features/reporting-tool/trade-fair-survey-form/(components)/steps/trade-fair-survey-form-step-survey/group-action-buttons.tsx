'use client'

import { useTranslations } from "next-intl"
import { ArrowDown, ArrowUp, Copy, Trash2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip"
import { cn } from "@/lib/utils"

type Props = {
  stepPosition: number
  groupPosition: number
  isFirstGroup: boolean
  isLastGroup: boolean
  moveGroup: (stepPosition: number, groupPosition: number, direction: 'up' | 'down') => void
  duplicateGroup: (stepPosition: number, groupPosition: number) => void
  deleteGroup: (stepPosition: number, groupPosition: number) => void
}

export default function GroupActionButtons({
  stepPosition,
  groupPosition,
  isFirstGroup,
  isLastGroup,
  moveGroup,
  duplicateGroup,
  deleteGroup,
}: Props) {
  const t = useTranslations('reportingTool.tradeFairSurveyForm')

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      {/* Move Up */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            role="button"
            tabIndex={isFirstGroup ? -1 : 0}
            onClick={(e) => {
              e.stopPropagation()
              if (!isFirstGroup) moveGroup(stepPosition, groupPosition, 'up')
            }}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.stopPropagation()
                if (!isFirstGroup) moveGroup(stepPosition, groupPosition, 'up')
              }
            }}
            className={cn(
              "h-8 w-8 shrink-0 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors text-primary",
              isFirstGroup ? "opacity-30 pointer-events-none" : "cursor-pointer"
            )}
          >
            <ArrowUp className="h-4 w-4" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {t('moveUp')}
        </TooltipContent>
      </Tooltip>

      {/* Move Down */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            role="button"
            tabIndex={isLastGroup ? -1 : 0}
            onClick={(e) => {
              e.stopPropagation()
              if (!isLastGroup) moveGroup(stepPosition, groupPosition, 'down')
            }}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.stopPropagation()
                if (!isLastGroup) moveGroup(stepPosition, groupPosition, 'down')
              }
            }}
            className={cn(
              "h-8 w-8 shrink-0 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors text-primary",
              isLastGroup ? "opacity-30 pointer-events-none" : "cursor-pointer"
            )}
          >
            <ArrowDown className="h-4 w-4" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {t('moveDown')}
        </TooltipContent>
      </Tooltip>

      {/* Duplicate */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation()
              duplicateGroup(stepPosition, groupPosition)
            }}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.stopPropagation()
                duplicateGroup(stepPosition, groupPosition)
              }
            }}
            className="h-8 w-8 shrink-0 flex items-center justify-center hover:bg-slate-100 rounded-full cursor-pointer transition-colors text-primary"
          >
            <Copy className="h-4 w-4" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {t('duplicateGroup')}
        </TooltipContent>
      </Tooltip>

      {/* Delete */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation()
              deleteGroup(stepPosition, groupPosition)
            }}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.stopPropagation()
                deleteGroup(stepPosition, groupPosition)
              }
            }}
            className="h-8 w-8 shrink-0 flex items-center justify-center hover:bg-slate-100 rounded-full cursor-pointer transition-colors text-primary"
          >
            <Trash2 className="h-4 w-4" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {t('deleteGroup')}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
