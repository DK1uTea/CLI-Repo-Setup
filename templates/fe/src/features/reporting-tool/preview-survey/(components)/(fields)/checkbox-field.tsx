'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import type { Question } from '../../../(helpers)/survey-detail-type';
import { getQuestionOptions } from '../../../(helpers)/survey-question-option-helper';

type CheckboxFieldProps = {
  fieldName: string;
  question: Question;
  errorMsg?: string;
};

export function CheckboxField({ fieldName, question, errorMsg }: CheckboxFieldProps) {
  const { control } = useFormContext();
  const t = useTranslations('reportingTool.previewSurvey');
  const options = getQuestionOptions(question.metadata);

  return (
    <div className="flex flex-col gap-2">
      <Label className="font-medium text-foreground">
        {question.content || t('defaultLabels.checkbox')}
        {question.isRequired && <span className="text-red-500"> *</span>}
      </Label>
      <Controller
        name={fieldName}
        control={control}
        render={({ field }) => {
          const currentValues = (field.value as string[]) || [];
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-1">
              {options.map((opt) => {
                const isChecked = currentValues.includes(opt.value);
                return (
                  <Label key={opt.value} htmlFor={`${fieldName}-${opt.value}`} className="flex items-center gap-2 bg-background rounded-choice h-11 px-4 cursor-pointer font-normal text-foreground">
                    <Checkbox
                      id={`${fieldName}-${opt.value}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const next = checked
                          ? [...currentValues, opt.value]
                          : currentValues.filter((v) => v !== opt.value);
                        field.onChange(next);
                      }}
                    />
                    <span className="font-normal">
                      {opt.label}
                    </span>
                  </Label>
                );
              })}
            </div>
          );
        }}
      />
      {errorMsg && <p className="text-xs text-destructive mt-1">{errorMsg}</p>}
    </div>
  );
}
