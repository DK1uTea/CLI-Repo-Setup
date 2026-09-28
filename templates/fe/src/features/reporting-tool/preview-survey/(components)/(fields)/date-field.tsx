'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Label } from '@/shared/components/ui/label';
import { DatePicker } from '@/shared/components/ui/date-picker';
import type { Question } from '../../../(helpers)/survey-detail-type';

import { dayjs } from '@/lib/date-utils';

type DateFieldProps = {
  fieldName: string;
  question: Question;
  errorMsg?: string;
};

export function DateField({ fieldName, question, errorMsg }: DateFieldProps) {
  const { control } = useFormContext();
  const t = useTranslations('reportingTool.previewSurvey');

  return (
    <div className="flex flex-col gap-2">
      <Label className="font-medium text-foreground">
        {question.content || t('defaultLabels.date')}
        {question.isRequired && <span className="text-red-500"> *</span>}
      </Label>
      <Controller
        name={fieldName}
        control={control}
        render={({ field }) => (
          <DatePicker
            className='h-11'
            value={field.value ? dayjs(field.value).toDate() : undefined}
            onChangeAction={(date) => field.onChange(date.toISOString())}
          />
        )}
      />
      {errorMsg && <p className="text-xs text-destructive mt-1">{errorMsg}</p>}
    </div>
  );
}
