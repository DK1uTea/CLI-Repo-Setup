'use client';

import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Label } from '@/shared/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import type { Question } from '../../../(helpers)/survey-detail-type';
import { getQuestionOptions } from '../../../(helpers)/survey-question-option-helper';

type MultiSelectDropdownFieldProps = {
  fieldName: string;
  question: Question;
  errorMsg?: string;
};

export function MultiSelectDropdownField({ fieldName, question, errorMsg }: MultiSelectDropdownFieldProps) {
  const t = useTranslations('reportingTool.questionForm');
  const previewT = useTranslations('reportingTool.previewSurvey');
  const { control } = useFormContext();
  const options = getQuestionOptions(question.metadata);
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <Label className="font-medium text-foreground">
        {question.content || previewT('defaultLabels.multiSelectDropdown')}
        {question.isRequired && <span className="text-red-500"> *</span>}
      </Label>
      <Controller
        name={fieldName}
        control={control}
        render={({ field }) => {
          const currentValues = (field.value as string[]) || [];

          // Get the labels of the selected options to display in the button
          const selectedLabels = options
            .filter((opt) => currentValues.includes(opt.value))
            .map((opt) => opt.label);

          const displayText = selectedLabels.length > 0
            ? selectedLabels.join(', ')
            : (question.placeholder || t('pleaseSelect'));

          return (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between rounded-select! border border-input bg-background px-4 font-normal text-sm hover:bg-background focus:border-primary aria-invalid:border-destructive h-11! flex items-center"
                >
                  <span className={cn("truncate text-left flex-1", selectedLabels.length > 0 ? "text-foreground" : "text-muted-foreground")}>
                    {displayText}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-(--radix-popover-trigger-width) p-2 bg-popover rounded-[16px] shadow-lg border border-border flex flex-col gap-2">
                <div className="_custom-scroll flex flex-col max-h-50 overflow-y-auto pr-1 gap-2">
                  {options.length === 0 ? (
                    <span className="text-xs text-muted-foreground p-2 text-center">{t('dropdownAddonNoOptions')}</span>
                  ) : (
                    options.map((opt) => {
                      const isChecked = currentValues.includes(opt.value);
                      return (
                        <div
                          key={opt.value}
                          className={cn(
                            "flex w-full cursor-pointer items-center gap-2 rounded-md py-2 px-3 text-sm text-left select-none outline-none hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary transition-colors",
                          )}
                          onClick={() => {
                            const next = isChecked
                              ? currentValues.filter((v) => v !== opt.value)
                              : [...currentValues, opt.value];
                            field.onChange(next);
                          }}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => { }} // Controlled by div onClick to avoid double triggers
                            className="pointer-events-none"
                          />
                          <span className="truncate">{opt.label}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </PopoverContent>
            </Popover>
          );
        }}
      />
      {errorMsg && <p className="text-xs text-destructive mt-1">{errorMsg}</p>}
    </div>
  );
}
