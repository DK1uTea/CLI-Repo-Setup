'use client';

import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import type { Question } from '../../../(helpers)/survey-detail-type';
import { getQuestionOptions } from '../../../(helpers)/survey-question-option-helper';

type SelectFieldProps = {
  fieldName: string;
  question: Question;
  errorMsg?: string;
};

export function SelectField({ fieldName, question, errorMsg }: SelectFieldProps) {
  const { control } = useFormContext();
  const t = useTranslations('reportingTool.previewSurvey');
  const [open, setOpen] = useState(false);
  const options = getQuestionOptions(question.metadata);

  return (
    <div className="flex flex-col gap-2">
      <Label className="font-medium text-foreground">
        {question.content || t('defaultLabels.dropdown')}
        {question.isRequired && <span className="text-red-500"> *</span>}
      </Label>
      <Controller
        name={fieldName}
        control={control}
        render={({ field }) => {
          const selectedOption = options.find((option) => option.value === field.value);

          return (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  aria-invalid={!!errorMsg}
                  className="h-11! w-full justify-between rounded-select! border border-input bg-background px-4 text-sm font-normal hover:bg-background focus:border-primary aria-invalid:border-destructive"
                >
                  <span className={selectedOption ? 'text-foreground' : 'text-muted-foreground'}>
                    {selectedOption?.label || question.placeholder || t('selectOption')}
                  </span>
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-(--radix-popover-trigger-width) rounded-[16px] border border-border bg-popover p-2 shadow-lg">
                <div className="_custom-scroll flex max-h-50 flex-col overflow-y-auto">
                  {options.map((option) => {
                    const isSelected = field.value === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={cn(
                          'flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-left text-sm outline-none transition-colors hover:bg-primary/10 hover:text-primary',
                          isSelected && 'bg-primary/10 font-medium text-primary',
                        )}
                        onClick={() => {
                          field.onChange(option.value);
                          setOpen(false);
                        }}
                      >
                        <span>{option.label}</span>
                        {isSelected && <Check className="size-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          );
        }}
      />
      {errorMsg && <p className="mt-1 text-xs text-destructive">{errorMsg}</p>}
    </div>
  );
}
