'use client';

import { useTranslations } from 'next-intl';
import { UserIcon, MailIcon, PhoneIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Card } from '@/shared/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion';
import type { EventDetail } from '../(hooks)/use-event-detail-data';

function IconField({ icon, label, value, href }: { icon: React.ReactNode; label: string; value?: string; href?: string }) {
  const inner = (
    <div className="flex items-center gap-3 rounded-detail-field bg-gray-100 px-4 py-2">
      <span className="shrink-0 text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm truncate" translate="no">{value || '—'}</p>
      </div>
    </div>
  );
  return href ? (
    <Link href={href} target="_blank" className="block no-underline!">
      {inner}
    </Link>
  ) : inner;
}

function TextField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="rounded-detail-field bg-gray-100 px-4 py-3 text-sm" translate="no">
        {value || '—'}
      </div>
    </div>
  );
}

type Props = { event: EventDetail };

export function EventDetailLogistics({ event }: Props) {
  const t = useTranslations('eventDetail');
  const logistics = event.logistics;

  if (!logistics) return null;

  return (
    <Card className="py-0">
      <Accordion type="single" collapsible defaultValue="open">
        <AccordionItem value="open" className="border-none">
          <AccordionTrigger className="px-6 py-4 hover:no-underline font-semibold text-lg">
            {t('logisticsInfo')}
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-5 space-y-4 h-auto!">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <IconField icon={<UserIcon className="size-5" />} label={t('contact')} value={logistics.contact?.name} />
              <IconField
                icon={<MailIcon className="size-5" />}
                label={t('email')}
                value={logistics.contact?.email}
                href={logistics.contact?.email ? `mailto:${logistics.contact.email}` : undefined}
              />
              <IconField
                icon={<PhoneIcon className="size-5" />}
                label={t('phone')}
                value={logistics.contact?.phone}
                href={logistics.contact?.phone ? `tel:${logistics.contact.phone}` : undefined}
              />
            </div>
            {logistics.warehouseName && (
              <div className="grid grid-cols-1 sm:grid-cols-3">
                <TextField label={t('warehouse')} value={logistics.warehouseName} />
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
