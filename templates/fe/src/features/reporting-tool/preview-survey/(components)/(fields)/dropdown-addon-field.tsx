'use client';

import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Label } from '@/shared/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Button } from '@/shared/components/ui/button';
import { ChevronDown, Check, PlusIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import type { Question } from '../../../(helpers)/survey-detail-type';
import { getQuestionOptions } from '../../../(helpers)/survey-question-option-helper';
import { Input } from '@/shared/components/ui/input';

type DropdownAddonFieldProps = {
  fieldName: string;
  question: Question;
  errorMsg?: string;
};

export function DropdownAddonField({ fieldName, question, errorMsg }: DropdownAddonFieldProps) {
  const t = useTranslations('reportingTool.questionForm');
  const previewT = useTranslations('reportingTool.previewSurvey');
  const { control } = useFormContext();
  const [options, setOptions] = useState(() => getQuestionOptions(question.metadata));
  const [newOption, setNewOption] = useState('');
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <Label className="font-medium text-foreground">
        {question.content || previewT('defaultLabels.dropdownAddon')}
        {question.isRequired && <span className="text-red-500"> *</span>}
      </Label>
      <Controller
        name={fieldName}
        control={control}
        render={({ field }) => {
          const selectedOption = options.find((opt) => opt.value === field.value);

          const handleSelect = (value: string) => {
            field.onChange(value);
            setOpen(false);
          };

          const handleAdd = (e: React.MouseEvent) => {
            e.stopPropagation();
            const trimmed = newOption.trim();
            if (!trimmed) return;

            // Check if option already exists
            const exists = options.find(
              (opt) => opt.value.toLowerCase() === trimmed.toLowerCase() || opt.label.toLowerCase() === trimmed.toLowerCase()
            );

            if (!exists) {
              const created = { label: trimmed, value: trimmed };
              setOptions((prev) => [...prev, created]);
              field.onChange(trimmed);
            } else {
              field.onChange(exists.value);
            }
            setNewOption('');
            setOpen(false);
          };

          return (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between rounded-select! border border-input bg-background px-4 font-normal text-sm hover:bg-background focus:border-primary aria-invalid:border-destructive h-11! flex items-center"
                >
                  {selectedOption ? (
                    <span className="text-foreground">{selectedOption.label}</span>
                  ) : (
                    <span className="text-muted-foreground">
                      {question.placeholder || t('pleaseSelect')}
                    </span>
                  )}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-(--radix-popover-trigger-width) p-2 bg-popover rounded-[16px] shadow-lg border border-border flex flex-col gap-2">
                {/* Input Addon Area */}
                <div className="flex items-center gap-2 border border-input rounded-input-group p-1 bg-background focus-within:border-primary">
                  <Input
                    type="text"
                    placeholder={t('dropdownAddonYourOption')}
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    className="flex-1 bg-transparent px-3 py-1.5 text-sm border-0 focus-visible:ring-0 focus-visible:outline-none focus:outline-none shadow-none min-w-0 h-9 rounded-input!"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const trimmed = newOption.trim();
                        if (trimmed) {
                          const exists = options.find(
                            (opt) => opt.value.toLowerCase() === trimmed.toLowerCase() || opt.label.toLowerCase() === trimmed.toLowerCase()
                          );
                          if (!exists) {
                            const created = { label: trimmed, value: trimmed };
                            setOptions((prev) => [...prev, created]);
                            field.onChange(trimmed);
                          } else {
                            field.onChange(exists.value);
                          }
                          setNewOption('');
                          setOpen(false);
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-lg text-primary/30 hover:bg-primary/10 h-8 px-3 rounded-full font-medium shrink-0"
                    onClick={handleAdd}
                  >
                    <PlusIcon data-icon="inline-start" /> {t('dropdownAddonAdd')}
                  </Button>
                </div>

                {/* Options List */}
                <div className="_custom-scroll flex flex-col max-h-50 overflow-y-auto pr-1">
                  {options.length === 0 ? (
                    <span className="text-xs text-muted-foreground p-2 text-center">{t('dropdownAddonNoOptions')}</span>
                  ) : (
                    options.map((opt) => {
                      const isChecked = field.value === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          className={cn(
                            "flex w-full cursor-pointer items-center justify-between rounded-md py-2 px-3 text-sm text-left select-none outline-none hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary transition-colors",
                            isChecked && "bg-primary/10 text-primary font-medium"
                          )}
                          onClick={() => handleSelect(opt.value)}
                        >
                          <span>{opt.label}</span>
                          {isChecked && <Check className="h-4 w-4 shrink-0" />}
                        </button>
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
