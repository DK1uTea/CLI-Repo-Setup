'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import type { Question } from '../../../(helpers)/survey-detail-type';
import { getCheckboxGroups } from '../../../(helpers)/survey-question-option-helper';

type Props = {
  fieldName: string;
  question: Question;
  errorMsg?: string;
};

const unique = (values: string[]) => [...new Set(values)];

export function CheckboxGroupField({ fieldName, question, errorMsg }: Props) {
  const { control } = useFormContext();
  const t = useTranslations('reportingTool.questionForm');
  const previewT = useTranslations('reportingTool.previewSurvey');
  const groups = getCheckboxGroups(question.metadata);

  return (
    <div className="flex flex-col gap-2">
      <Label className="font-medium text-foreground">
        {question.content || previewT('defaultLabels.checkboxGroup')}
        {question.isRequired && <span className="text-destructive"> *</span>}
      </Label>

      <Controller
        name={fieldName}
        control={control}
        render={({ field }) => {
          const validValues = new Set(groups.flatMap(group => group.options.map(option => option.value)));
          const currentValues = unique(
            (Array.isArray(field.value) ? field.value : []).filter((value): value is string =>
              typeof value === 'string' && validValues.has(value)
            )
          );
          const allValues = [...validValues];
          const allChecked = allValues.length > 0 && allValues.every(value => currentValues.includes(value));

          const toggleValues = (values: string[]) => {
            const everySelected = values.length > 0 && values.every(value => currentValues.includes(value));
            field.onChange(
              everySelected
                ? currentValues.filter(value => !values.includes(value))
                : unique([...currentValues, ...values])
            );
          };

          return (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 gap-2 pl-1 sm:grid-cols-2">
                <CheckboxRow
                  label={t('selectAll')}
                  checked={allChecked}
                  onCheckedChange={() => toggleValues(allValues)}
                  className="h-11 rounded-choice bg-background px-4 py-0 text-foreground"
                />
                <CheckboxRow
                  label={t('selectNone')}
                  checked={currentValues.length === 0}
                  onCheckedChange={() => field.onChange([])}
                  className="h-11 rounded-choice bg-background px-4 py-0 text-foreground"
                />
              </div>

              <div className="flex flex-col gap-3">
                {groups.map((group, groupIndex) => {
                  const groupValues = group.options.map(option => option.value);
                  const selectedCount = groupValues.filter(value => currentValues.includes(value)).length;
                  const groupChecked = groupValues.length > 0 && selectedCount === groupValues.length;

                  return (
                    <div key={`${group.label}-${groupIndex}`} className="rounded-3xl bg-background">
                      <CheckboxRow
                        label={group.label}
                        checked={groupChecked}
                        onCheckedChange={() => toggleValues(groupValues)}
                        className="font-semibold"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2">
                        {group.options.map((option, optionIndex) => (
                          <CheckboxRow
                            key={`${option.value}-${optionIndex}`}
                            label={option.label}
                            checked={currentValues.includes(option.value)}
                            onCheckedChange={() => toggleValues([option.value])}
                            className="pl-9"
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }}
      />

      {errorMsg && <p className="mt-1 text-xs text-destructive">{errorMsg}</p>}
    </div>
  );
}

function CheckboxRow({
  label,
  checked,
  onCheckedChange,
  className,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: () => void;
  className?: string;
}) {
  return (
    <Label className={`flex min-h-11 cursor-pointer items-center gap-2 px-4 py-2 font-normal ${className ?? ''}`}>
      <Checkbox checked={checked} onCheckedChange={onCheckedChange} />
      <span>{label}</span>
    </Label>
  );
}
