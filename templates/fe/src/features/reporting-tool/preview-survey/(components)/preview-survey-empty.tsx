'use client';

import { ClipboardList } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from '@/shared/components/ui/empty';

export function PreviewSurveyEmpty() {
  const t = useTranslations('reportingTool.previewSurvey');

  return (
    <Empty className="py-12 border rounded-[24px] bg-card">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ClipboardList className="size-5 text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle>{t('noStepsTitle')}</EmptyTitle>
        <EmptyDescription>
          {t('noStepsDescription')}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
