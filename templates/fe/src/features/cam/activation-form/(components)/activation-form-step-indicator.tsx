import { useTranslations } from 'next-intl'

const TOTAL_STEPS = 2

const STEP_LABEL_KEYS = ['chooseStore', 'step2'] as const

type Props = { step: number }

export function ActivationFormStepIndicator({ step }: Props) {
  const t = useTranslations('activationForm.steps')
  const labelKey = STEP_LABEL_KEYS[step - 1]
  const progress = Math.round((step / TOTAL_STEPS) * 100)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-lg">
        <span className="font-medium text-foreground">{t(labelKey)}</span>
        <span className="text-muted-foreground text-sm">{step} of {TOTAL_STEPS}</span>
      </div>
      <div className="h-1 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
