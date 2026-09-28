'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import type { Question } from '../../../(helpers)/survey-detail-type';

type TextareaFieldProps = {
  fieldName: string;
  question: Question;
  errorMsg?: string;
};

export function TextareaField({ fieldName, question, errorMsg }: TextareaFieldProps) {
  const { register } = useFormContext();
  const t = useTranslations('reportingTool.questionForm');

  const label = question.content || t('longTextDefaultLabel');
  const placeholder = question.placeholder || t('longTextDefaultPlaceholder');

  return (
    <div className="flex flex-col gap-2">
      <Label className="font-medium text-foreground">
        {label}
        {question.isRequired && <span className="text-red-500"> *</span>}
      </Label>
      <Textarea
        placeholder={placeholder}
        aria-invalid={!!errorMsg}
        {...register(fieldName)}
        className="bg-background rounded-4xl p-4"
      />
      {errorMsg && <p className="text-xs text-destructive mt-1">{errorMsg}</p>}
    </div>
  );
}
