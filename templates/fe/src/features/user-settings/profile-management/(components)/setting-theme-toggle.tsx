'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useFormContext, useWatch } from 'react-hook-form'
import { MoonIcon, SunIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardTitle } from '@/shared/components/ui/card'
import type { ProfileFormValues } from '../(helpers)/profile-schema'

export function SettingThemeToggle() {
  const t = useTranslations('settings')
  const { theme, setTheme } = useTheme()
  const { setValue } = useFormContext<ProfileFormValues>()
  const appearance = useWatch<ProfileFormValues, 'appearance'>({ name: 'appearance' })
  const formTheme = useWatch<ProfileFormValues, 'theme'>({ name: 'theme' })
  const [mounted, setMounted] = useState(false)
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>(() => normalizeTheme(theme))

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const nextTheme = appearance || formTheme

    if (nextTheme) {
      setPreviewTheme(normalizeTheme(nextTheme))
    }
  }, [appearance, formTheme])

  const currentTheme = previewTheme
  const isLight = currentTheme === 'light'

  const handleToggle = () => {
    const next = currentTheme === 'light' ? 'dark' : 'light'

    setPreviewTheme(next)
    applyPreviewTheme(next)
    setTheme(next)
    setValue('theme', next, { shouldDirty: true, shouldTouch: true, shouldValidate: false })
    setValue('appearance', next.toUpperCase(), { shouldDirty: true, shouldTouch: true, shouldValidate: false })
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center justify-between">
        <CardTitle className="text-lg font-semibold">{t('dashboardAppearance')}</CardTitle>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{t('interfaceTheme')}</span>

          <button
            type="button"
            aria-label={t('interfaceTheme')}
            onClick={handleToggle}
            aria-pressed={mounted ? isLight : undefined}
            className="relative inline-flex h-10 w-24 cursor-pointer items-center rounded-[11px] bg-muted p-1 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span
              className={cn(
                'pointer-events-none absolute flex h-8 w-10 items-center justify-center rounded-[8px] bg-background shadow-sm transition-transform duration-300 ease-in-out',
                isLight ? 'translate-x-12' : 'translate-x-0'
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                'pointer-events-none absolute left-1 flex h-8 w-10 items-center justify-center transition-all duration-300',
                !isLight ? 'text-primary opacity-100 scale-110' : 'text-muted-foreground opacity-50 scale-100'
              )}
            >
              <MoonIcon className="size-5" />
            </span>
            <span
              className={cn(
                'pointer-events-none absolute right-1 flex h-8 w-10 items-center justify-center transition-all duration-300',
                isLight ? 'text-primary opacity-100 scale-110' : 'text-muted-foreground opacity-50 scale-100'
              )}
            >
              <SunIcon className="size-5" />
            </span>
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

function normalizeTheme(value?: string) {
  return value?.toLowerCase() === 'dark' ? 'dark' : 'light'
}

function applyPreviewTheme(theme: 'light' | 'dark') {
  const root = document.documentElement

  root.classList.remove('light', 'dark')
  root.classList.add(theme)
  root.style.colorScheme = theme
  window.localStorage.setItem('theme', theme)
}
