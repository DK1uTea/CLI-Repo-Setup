'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Minus, Plus } from 'lucide-react';
import { Label } from '@/shared/components/ui/label';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/shared/components/ui/input-group';
import { translateErrorMessage } from '@/lib/field-error';
import type { Question } from '../../../(helpers)/survey-detail-type';

type NumberFieldProps = {
  fieldName: string;
  question: Question;
  errorMsg?: string;
};

export function NumberField({ fieldName, question, errorMsg }: NumberFieldProps) {
  const { control } = useFormContext();
  const t = useTranslations('reportingTool.previewSurvey');

  const min = question.metadata?.min !== undefined && question.metadata?.min !== null ? Number(question.metadata.min) : undefined;
  const max = question.metadata?.max !== undefined && question.metadata?.max !== null ? Number(question.metadata.max) : undefined;

  return (
    <div className="flex flex-col gap-2">
      <Label className="font-medium text-foreground">
        {question.content || t('defaultLabels.number')}
        {question.isRequired && <span className="text-red-500"> *</span>}
      </Label>
      <Controller
        name={fieldName}
        control={control}
        render={({ field }) => {
          const rawValue = field.value;
          const parsedValue = Number(rawValue);
          const isValueValid = rawValue !== undefined && rawValue !== null && rawValue !== '' && !isNaN(parsedValue);

          const handleIncrement = () => {
            let nextValue;
            if (!isValueValid) {
              nextValue = min !== undefined ? min : 1;
            } else {
              nextValue = parsedValue + 1;
            }
            if (max !== undefined && nextValue > max) return;
            field.onChange(nextValue);
          };

          const handleDecrement = () => {
            let nextValue;
            if (!isValueValid) {
              nextValue = min !== undefined ? min : -1;
            } else {
              nextValue = parsedValue - 1;
            }
            if (min !== undefined && nextValue < min) return;
            field.onChange(nextValue);
          };

          return (
            <InputGroup className="h-11 bg-background rounded-input-group! pr-3">
              <InputGroupInput
                type="number"
                min={min}
                max={max}
                placeholder={question.placeholder || ''}
                aria-invalid={!!errorMsg}
                value={field.value ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    field.onChange('');
                  } else {
                    field.onChange(Number(val));
                  }
                }}
                ref={field.ref}
              />
              <InputGroupAddon align="inline-end" className="p-0 flex gap-1">
                <InputGroupButton
                  type="button"
                  onClick={handleIncrement}
                  variant="ghost"
                  size="icon-xs"
                  className="hover:bg-muted"
                  disabled={max !== undefined && isValueValid && parsedValue >= max}
                >
                  <Plus className="size-4" />
                </InputGroupButton>
                <InputGroupButton
                  type="button"
                  onClick={handleDecrement}
                  variant="ghost"
                  size="icon-xs"
                  className="hover:bg-muted"
                  disabled={min !== undefined && isValueValid && parsedValue <= min}
                >
                  <Minus className="size-4" />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          );
        }}
      />
      {errorMsg && (
        <p className="text-xs text-destructive mt-1">
          {translateErrorMessage(errorMsg, { min: min ?? '', max: max ?? '' })}
        </p>
      )}
    </div>
  );
}
