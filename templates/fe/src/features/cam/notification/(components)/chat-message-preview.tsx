type Props = {
  activationName?: string
  activationCode?: string
  count: number
  time: string
  label: string
}

export function ChatMessagePreview({ activationName, activationCode, count, time, label }: Props) {
  const title = activationName || activationCode

  return (
    <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-foreground leading-snug">{label}</span>
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
          {count}
        </span>
      </div>
      {title && <p className="mt-1 text-sm text-primary line-clamp-2">{title}</p>}
      <p className="mt-1 text-xs text-muted-foreground">{time}</p>
    </div>
  )
}
