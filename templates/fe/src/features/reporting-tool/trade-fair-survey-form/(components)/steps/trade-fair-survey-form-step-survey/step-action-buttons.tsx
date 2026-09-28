'use client'

import { useTranslations } from "next-intl"
import { ArrowDown, ArrowUp, Copy, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip"
import { StepDto } from "../../../(helpers)/trade-fair-survey-form-schema"

type Props = {
  step: StepDto
  isFirstMovableStep: boolean
  isLastStep: boolean
  moveStep: (position: number, direction: 'up' | 'down') => void
  duplicateStep: (position: number) => void
  deleteStep: (position: number) => void
}

export default function StepActionButtons({
  step,
  isFirstMovableStep,
  isLastStep,
  moveStep,
  duplicateStep,
  deleteStep,
}: Props) {
  const t = useTranslations('reportingTool.tradeFairSurveyForm')

  return (
    <div className="flex items-center gap-1 border-r" onClick={(e) => e.stopPropagation()}>
      {/* Move Up */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            role="button"
            tabIndex={isFirstMovableStep ? -1 : 0}
            onClick={(e) => {
              e.stopPropagation()
              if (!isFirstMovableStep) moveStep(step.position, 'up')
            }}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.stopPropagation()
                if (!isFirstMovableStep) moveStep(step.position, 'up')
              }
            }}
            className={cn(
              "h-8 w-8 shrink-0 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors text-primary",
              isFirstMovableStep ? "opacity-30 pointer-events-none" : "cursor-pointer"
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
            tabIndex={isLastStep ? -1 : 0}
            onClick={(e) => {
              e.stopPropagation()
              if (!isLastStep) moveStep(step.position, 'down')
            }}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.stopPropagation()
                if (!isLastStep) moveStep(step.position, 'down')
              }
            }}
            className={cn(
              "h-8 w-8 shrink-0 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors text-primary",
              isLastStep ? "opacity-30 pointer-events-none" : "cursor-pointer"
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
              duplicateStep(step.position)
            }}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.stopPropagation()
                duplicateStep(step.position)
              }
            }}
            className="h-8 w-8 shrink-0 flex items-center justify-center hover:bg-slate-100 rounded-full cursor-pointer transition-colors text-primary"
          >
            <Copy className="h-4 w-4" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {t('duplicateStep')}
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
              deleteStep(step.position)
            }}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.stopPropagation()
                deleteStep(step.position)
              }
            }}
            className="h-8 w-8 shrink-0 flex items-center justify-center hover:bg-slate-100 rounded-full cursor-pointer transition-colors text-primary"
          >
            <Trash2 className="h-4 w-4" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {t('deleteStep')}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
