'use client'

import { useTranslations } from 'next-intl'
import { Controller } from 'react-hook-form'
import { Input } from '@/shared/components/ui/input'
import { Switch } from '@/shared/components/ui/switch'
import InfoTooltip from './info-tooltip'
import QuestionTypePicker from './question-type-picker'
import QuestionOptions from './question-options'
import { QuestionType } from '@/features/reporting-tool/(helpers)/survey-detail-type'
import { useQuestionForm } from '../../../(hooks)/use-question-form'
import QuestionCheckboxGroups from './question-checkbox-groups'

export default function QuestionForm() {
  const t = useTranslations('reportingTool.questionForm')

  const {
    control,
    errors,
    setValue,
    typeValue,
    fields,
    append,
    insert,
    remove,
    move,
    showOptions,
    showPlaceholder,
    handleTypeChange,
    handleAddOption
  } = useQuestionForm()

  return (
    <div className="flex flex-col gap-4 py-2">
      {/* Question Type */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-semibold text-muted-foreground">{t('questionType')}</label>
          <InfoTooltip content={t('questionTypeInfo')} />
        </div>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <QuestionTypePicker
              value={field.value as QuestionType}
              onChange={handleTypeChange}
            />
          )}
        />
      </div>

      {/* Question Label / Content */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-semibold text-muted-foreground">{t('label')}</label>
          <InfoTooltip content={t('labelInfo')} />
        </div>
        <Controller
          control={control}
          name="content"
          render={({ field }) => (
            <Input
              {...field}
              value={field.value ?? ''}
              placeholder={
                typeValue === 'MULTI_SELECT_DROPDOWN'
                  ? t('skillsPlaceholder')
                  : typeValue === 'DROPDOWN_ADD_ON'
                    ? t('countryPlaceholder')
                    : t('labelPlaceholder')
              }
              error={errors.content?.message}
            />
          )}
        />
      </div>

      {/* Placeholder */}
      {showPlaceholder && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <label className="text-sm font-semibold text-muted-foreground">{t('placeholderLabel')}</label>
            <InfoTooltip content={t('placeholderLabelInfo')} />
          </div>
          <Controller
            control={control}
            name="placeholder"
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ''}
                placeholder={
                  typeValue === 'DATE'
                    ? t('datePlaceholderPattern')
                    : typeValue === 'EMAIL'
                      ? t('emailPlaceholderPattern')
                      : typeValue === 'ADDRESS'
                        ? t('addressPlaceholderPattern')
                        : typeValue === 'MULTI_SELECT_DROPDOWN'
                          ? t('multiSelectPlaceholderPattern')
                          : typeValue === 'DROPDOWN_ADD_ON'
                            ? t('dropdownAddonPlaceholderPattern')
                            : t('placeholderInput')
                }
                error={errors.placeholder?.message}
              />
            )}
          />
        </div>
      )}

      {/* Allowed range for INPUT_NUMBER */}
      {typeValue === 'INPUT_NUMBER' && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <label className="text-sm font-semibold text-muted-foreground">{t('allowedRange')}</label>
            <InfoTooltip content={t('allowedRangeInfo')} />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <Controller
                control={control}
                name="metadata.min"
                render={({ field }) => (
                  <Input
                    type="number"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? null : Number(e.target.value);
                      field.onChange(val);
                    }}
                    placeholder={t('minPlaceholder')}
                    error={(errors.metadata as any)?.min?.message}
                  />
                )}
              />
            </div>
            <div className="flex-1">
              <Controller
                control={control}
                name="metadata.max"
                render={({ field }) => (
                  <Input
                    type="number"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? null : Number(e.target.value);
                      field.onChange(val);
                    }}
                    placeholder={t('maxPlaceholder')}
                    error={(errors.metadata as any)?.max?.message}
                  />
                )}
              />
            </div>
          </div>
        </div>
      )}

      {/* Answer options section */}
      {showOptions && (
        <QuestionOptions
          control={control}
          errors={errors}
          fields={fields}
          remove={remove}
          move={move}
          setValue={setValue}
          handleAddOption={handleAddOption}
        />
      )}

      {typeValue === 'CHECKBOX_GROUP' && (
        <QuestionCheckboxGroups
          fields={fields}
          append={append}
          insert={insert}
          remove={remove}
          move={move}
        />
      )}

      {/* Required Toggle */}
      <Controller
        control={control}
        name="isRequired"
        render={({ field }) => (
          <div
            className="flex items-center justify-between gap-4 p-4 rounded-xl border bg-muted/30 cursor-pointer select-none"
            onClick={() => field.onChange(!field.value)}
          >
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold text-foreground">{t('requiredField')}</p>
              <p className="text-xs text-muted-foreground">{t('requiredFieldDesc')}</p>
            </div>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              onClick={e => e.stopPropagation()}
            />
          </div>
        )}
      />
    </div>
  )
}
