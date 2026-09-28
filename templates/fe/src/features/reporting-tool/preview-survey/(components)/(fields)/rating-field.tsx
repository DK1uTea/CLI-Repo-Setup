'use client';

import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { IconStar } from '@/shared/components/common/icons';
import type { Question } from '../../../(helpers)/survey-detail-type';

type RatingFieldProps = {
  fieldName: string;
  question: Question;
  errorMsg?: string;
};

export function RatingField({ fieldName, question, errorMsg }: RatingFieldProps) {
  const { control } = useFormContext();
  const t = useTranslations('reportingTool.previewSurvey');
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <Label className="font-medium text-foreground">
        {question.content || t('defaultLabels.rating')}
        {question.isRequired && <span className="text-red-500"> *</span>}
      </Label>
      <Controller
        name={fieldName}
        control={control}
        render={({ field }) => {
          const currentValue = Number(field.value) || 0;

          return (
            <div className="flex items-center gap-1 pl-1 h-11">
              {[1, 2, 3, 4, 5].map((starValue) => {
                const isFilled = hoverValue !== null ? starValue <= hoverValue : starValue <= currentValue;
                return (
                  <Button
                    key={starValue}
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="hover:bg-transparent transition-transform duration-200 ease-in-out hover:scale-125 active:scale-95 cursor-pointer size-8"
                    onClick={() => {
                      if (currentValue === starValue) {
                        field.onChange(0);
                      } else {
                        field.onChange(starValue);
                      }
                    }}
                    onMouseEnter={() => setHoverValue(starValue)}
                    onMouseLeave={() => setHoverValue(null)}
                  >
                    <IconStar
                      fill={isFilled ? '#facc15' : '#e2e2e2'}
                      style={{ transition: 'fill 0.15s' }}
                      className="size-7"
                    />
                  </Button>
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
