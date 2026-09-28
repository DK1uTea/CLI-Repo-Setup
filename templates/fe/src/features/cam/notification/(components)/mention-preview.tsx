'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { sanitizeHtmlForEditor } from '@/lib/html-utils'

type Props = {
  content: string
  time: string
  showMoreLabel: string
}

export function MentionPreview({ content, time, showMoreLabel }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [overflowing, setOverflowing] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    setOverflowing(el.scrollHeight > el.clientHeight + 1)
  }, [content])

  return (
    <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
      <p className="text-xs text-muted-foreground mb-1">{time}</p>
      <div
        ref={contentRef}
        className={cn(
          'prose prose-sm max-w-none leading-snug wrap-break-word text-foreground [&_p]:my-0',
          !expanded && 'line-clamp-3',
        )}
        dangerouslySetInnerHTML={{ __html: sanitizeHtmlForEditor(content) }}
      />
      {overflowing && !expanded && (
        <button
          type="button"
          className="mt-2 rounded border border-border bg-background px-3 py-1 text-xs text-foreground hover:bg-muted transition-colors"
          onClick={(event) => {
            event.stopPropagation()
            setExpanded(true)
          }}
        >
          {showMoreLabel}
        </button>
      )}
    </div>
  )
}
