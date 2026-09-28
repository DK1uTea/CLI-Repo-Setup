'use client';

import { ClipboardX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from '@/shared/components/ui/empty';

const LeadDetailNoData = () => {
  const t = useTranslations('reportingTool.leadDetail');

  return (
    <Empty className="py-12 border rounded-[24px] bg-card">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ClipboardX className="size-5 text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle>{t('noDataTitle')}</EmptyTitle>
        <EmptyDescription>
          {t('noDataDescription')}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};

export default LeadDetailNoData;
