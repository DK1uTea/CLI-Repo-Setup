'use client'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  content: React.ReactNode
  iconClassName?: string
  contentClassName?: string
}

export default function InfoTooltip({ content, iconClassName, contentClassName }: Props) {
  return (
    <Tooltip>
      <TooltipTrigger type="button" className="cursor-help! flex items-center" tabIndex={-1}>
        <Info className={cn("size-3.5 text-muted-foreground/50", iconClassName)} />
      </TooltipTrigger>
      <TooltipContent className={cn("max-w-75", contentClassName)}>
        {content}
      </TooltipContent>
    </Tooltip>
  )
}
