'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Label } from '@/shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import type { Question } from '../../../(helpers)/survey-detail-type';
import { getQuestionOptions } from '../../../(helpers)/survey-question-option-helper';

type ChoiceFieldProps = {
  fieldName: string;
  question: Question;
  errorMsg?: string;
};

export function ChoiceField({ fieldName, question, errorMsg }: ChoiceFieldProps) {
  const { control } = useFormContext();
  const t = useTranslations('reportingTool.previewSurvey');
  const choiceOptions = question.type === 'YES_NO'
    ? [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]
    : getQuestionOptions(question.metadata);

  return (
    <div className="flex flex-col gap-2">
      <Label className="font-medium text-foreground">
        {question.content || t(
          question.type === 'YES_NO' ? 'defaultLabels.yesNo' : 'defaultLabels.choice',
        )}
        {question.isRequired && <span className="text-red-500"> *</span>}
      </Label>
      <Controller
        name={fieldName}
        control={control}
        render={({ field }) => (
          <RadioGroup
            value={field.value !== undefined ? String(field.value) : ''}
            onValueChange={(val) => {
              const parsedVal = question.type === 'YES_NO' ? val === 'true' : val;
              field.onChange(parsedVal);
            }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-1"
          >
            {choiceOptions.map((opt) => (
              <Label key={opt.value} htmlFor={`${fieldName}-${opt.value}`} className="flex items-center gap-2 bg-background rounded-choice h-11 px-4 cursor-pointer font-normal text-foreground">
                <RadioGroupItem value={opt.value} id={`${fieldName}-${opt.value}`} className='size-5 bg-card border-2'/>
                <span className="font-normal">
                  {opt.label}
                </span>
              </Label>
            ))}
          </RadioGroup>
        )}
      />
      {errorMsg && <p className="text-xs text-destructive mt-1">{errorMsg}</p>}
    </div>
  );
}
