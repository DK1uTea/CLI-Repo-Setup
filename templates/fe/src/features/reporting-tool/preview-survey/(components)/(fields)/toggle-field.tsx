'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { useTranslations } from 'next-intl';
import type { Question } from '../../../(helpers)/survey-detail-type';

type ToggleFieldProps = {
  fieldName: string;
  question: Question;
  errorMsg?: string;
};

export function ToggleField({ fieldName, question, errorMsg }: ToggleFieldProps) {
  const { control } = useFormContext();
  const t = useTranslations('reportingTool.answerDetail');
  const previewT = useTranslations('reportingTool.previewSurvey');

  return (
    <div className="flex flex-col gap-2">
      <Label className="font-medium text-foreground cursor-pointer" htmlFor={fieldName}>
        {question.content || previewT('defaultLabels.toggle')}
        {question.isRequired && <span className="text-red-500"> *</span>}
      </Label>
      <div className="flex items-center gap-2 px-3 h-11 border bg-background rounded-choice">
        <Controller
          name={fieldName}
          control={control}
          render={({ field }) => (
            <>
              <Switch
                id={fieldName}
                checked={!!field.value}
                onCheckedChange={field.onChange}
                className="scale-115 origin-left"
              />
              {field.value && (
                <span className="text-sm font-medium text-foreground select-none ml-3">
                  {t('yes')}
                </span>
              )}
            </>
          )}
        />
      </div>
      {errorMsg && <p className="text-xs text-destructive mt-1">{errorMsg}</p>}
    </div>
  );
}
