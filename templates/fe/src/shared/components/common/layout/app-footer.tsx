'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Separator } from '@/shared/components/ui/separator';

export function AppFooter() {
  const t = useTranslations('footer');
  const { version, date } = parseAppVersion(process.env.NEXT_PUBLIC_VERSION);

  return (
    <footer className="px-6 py-6">
      <div className={cn('rounded-[20px] bg-footer px-4 py-7 sm:p-10 md:px-5 md:pt-10 md:pb-5')}>
        {/* Top: Brand info */}
        <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
          <div className="font-bold text-lg text-primary">
            <span>{{projectNameTitle}}</span>
          </div>
        </div>

        {/* Divider */}
        <Separator className="md:mt-10! md:mb-5! my-5 bg-footer-foreground/20" />

        {/* Bottom: Copyright */}
        <div className="flex flex-col-reverse items-center justify-between gap-5 text-[15px] font-light sm:flex-row">
          <p className="text-footer-foreground/50 order-1 md:order-0">
            © {new Date().getFullYear()} {{projectNameTitle}}. All rights reserved.
          </p>
        </div>

        {/* Version */}
        {(version || date) && (
          <p className="mt-2 text-sm font-light text-muted-foreground opacity-50 text-center md:text-start">
            {version && <span>{t('version')}: {version}</span>}
            {version && date && <span> - </span>}
            {date && <span>{t('lastUpdate')}: {date}</span>}
          </p>
        )}
      </div>
    </footer>
  );
}

function parseAppVersion(value?: string) {
  if (!value) return { version: '', date: '' };
  const parts = value.split('-');
  const date = parts.pop() ?? '';
  const version = parts.join('-');
  return { version, date };
}
