"use client"

import { ChevronLeft } from 'lucide-react'
import { Link, usePathname } from '@/i18n/navigation'
import { dayjs } from '@/lib/date-utils'
import { useTranslations } from 'next-intl'

const policyLinks = [
  { href: '/impressum', labelKey: 'impressum' },
  { href: '/datenschutz', labelKey: 'privacyPolicy' },
  { href: '/agb', labelKey: 'agb' },
  { href: '/support', labelKey: 'support' },
] as const

const hiddenPathsByLink = {
  '/impressum': ['/impressum'],
  '/datenschutz': ['/datenschutz', '/privacy-policy'],
  '/agb': ['/agb'],
  '/support': ['/support'],
} as const

const PolicyCopyright = () => {
  const tf = useTranslations('footer')
  const tp = useTranslations('policy')
  const pathname = usePathname()
  const year = dayjs.utc().year()

  return (
    <div className="flex w-full flex-col items-center gap-4 px-4 pb-4 text-base font-medium font-brand-wide md:px-0">
      <div className="flex w-full flex-col items-center justify-center gap-3 md:flex-row md:gap-5.5">
        <span className="whitespace-nowrap text-center text-foreground md:text-left">
          {tf('copyright', { year })}
        </span>
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5.5">
          {policyLinks
            .filter(({ href }) => !hiddenPathsByLink[href].some((path) => path === pathname))
            .map(({ href, labelKey }) => (
              <Link key={href} href={href} className="hover:underline underline-offset-2 hover:opacity-80">
                {tf(labelKey)}
              </Link>
            ))}
          <Link href="/login" className="hidden items-center gap-1.5 text-destructive hover:underline underline-offset-2 hover:opacity-80 md:flex">
            <ChevronLeft className="text-destructive" />
            <span>{tp('backToLogin')}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PolicyCopyright