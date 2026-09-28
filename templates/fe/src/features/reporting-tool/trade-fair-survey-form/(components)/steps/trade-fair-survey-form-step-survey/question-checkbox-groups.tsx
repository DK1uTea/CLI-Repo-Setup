'use client'

import { useState } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { ChevronDown, Copy, Plus, Trash2, ArrowDown, ArrowUp } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/lib/utils'
import type { CheckboxGroupDto, QuestionDto } from '../../../(helpers)/trade-fair-survey-form-schema'
import { createCheckboxOptionValue } from '../../../(hooks)/use-question-form'
import { useTranslations } from 'next-intl'

type Props = {
  fields: Array<{ id: string }>
  append: (value: CheckboxGroupDto) => void
  insert: (index: number, value: CheckboxGroupDto) => void
  remove: (index: number) => void
  move: (from: number, to: number) => void
}

const createDefaultGroup = (index: number): CheckboxGroupDto => ({
  label: `Group ${index + 1}`,
  options: [
    { label: 'Option 1', value: createCheckboxOptionValue() },
    { label: 'Option 2', value: createCheckboxOptionValue() },
  ],
})

export default function QuestionCheckboxGroups({ fields, append, insert, remove, move }: Props) {
  const t = useTranslations('reportingTool.questionForm')
  const { control, getValues, setValue, formState: { errors } } = useFormContext<QuestionDto>()
  const groups = (useWatch({ control, name: 'metadata.options' }) ?? []) as CheckboxGroupDto[]
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  const updateGroups = (next: CheckboxGroupDto[]) => {
    setValue('metadata.options', next, { shouldDirty: true, shouldValidate: true })
  }

  const moveGroup = (index: number, offset: -1 | 1) => {
    const targetIndex = index + offset
    if (targetIndex < 0 || targetIndex >= groups.length) return
    move(index, targetIndex)
  }

  const duplicateGroup = (index: number) => {
    const source = groups[index]
    const copy: CheckboxGroupDto = {
      label: `${source.label} (Copy)`,
      options: source.options.map(option => ({
        ...option,
        value: createCheckboxOptionValue(),
      })),
    }
    insert(index + 1, copy)
  }

  const toggleCollapsed = (fieldId: string) => {
    setCollapsedGroups(current => {
      const next = new Set(current)
      if (next.has(fieldId)) next.delete(fieldId)
      else next.add(fieldId)
      return next
    })
  }

  const optionErrors = (errors.metadata as any)?.options

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-semibold text-muted-foreground">{t('answerOptions')}</span>

      {groups.map((group, groupIndex) => {
        const fieldId = fields[groupIndex]?.id ?? String(groupIndex)
        const collapsed = collapsedGroups.has(fieldId)

        return (
          <div key={fieldId} className="overflow-hidden rounded-3xl border bg-background">
            <div className="flex items-center gap-2 bg-muted/40 p-2">
              <Controller
                control={control}
                name={`metadata.options.${groupIndex}.label` as any}
                render={({ field }) => (
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    placeholder={`${t('checkboxGroupName')} ${groupIndex + 1}`}
                    wrapperClassName="min-w-0 flex-1"
                    error={optionErrors?.[groupIndex]?.label?.message}
                  />
                )}
              />
              <div className="flex shrink-0 items-center gap-1">
                <Button type="button" variant="ghost" size="icon-sm" disabled={groupIndex === 0} onClick={() => moveGroup(groupIndex, -1)} aria-label={t('moveGroupUp')}>
                  <ArrowUp />
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" disabled={groupIndex === groups.length - 1} onClick={() => moveGroup(groupIndex, 1)} aria-label={t('moveGroupDown')}>
                  <ArrowDown />
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => duplicateGroup(groupIndex)} aria-label={t('duplicateGroup')}>
                  <Copy />
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" disabled={groups.length <= 1} onClick={() => remove(groupIndex)} aria-label={t('deleteGroup')} className="text-destructive">
                  <Trash2 />
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => toggleCollapsed(fieldId)} aria-label={t('toggleGroup')}>
                  <ChevronDown className={cn('transition-transform', !collapsed && 'rotate-180')} />
                </Button>
              </div>
            </div>

            {!collapsed && (
              <div className="flex flex-col gap-2 p-3">
                {group.options.map((option, optionIndex) => (
                  <div
                    key={`${fieldId}-option-${option.value || optionIndex}-${optionIndex}`}
                    className="relative bg-background"
                  >
                    <Controller
                      control={control}
                      name={`metadata.options.${groupIndex}.options.${optionIndex}.label` as any}
                      render={({ field }) => (
                        <Input
                          {...field}
                          value={field.value ?? ''}
                          placeholder={`${t('answerPlaceholder')} ${optionIndex + 1}`}
                          wrapperClassName="min-w-0"
                          className="pr-10"
                          error={optionErrors?.[groupIndex]?.options?.[optionIndex]?.label?.message}
                        />
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={group.options.length <= 1}
                      onClick={() => {
                        const next = getValues('metadata.options') as CheckboxGroupDto[]
                        next[groupIndex] = {
                          ...next[groupIndex],
                          options: next[groupIndex].options.filter((_, index) => index !== optionIndex),
                        }
                        updateGroups([...next])
                      }}
                      className="absolute right-1 top-1 size-8 text-destructive hover:bg-destructive/10"
                      aria-label={t('deleteOption')}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline-primary"
                  onClick={() => {
                    const next = [...groups]
                    next[groupIndex] = {
                      ...next[groupIndex],
                      options: [
                        ...next[groupIndex].options,
                        {
                          label: `${t('answerPlaceholder')} ${next[groupIndex].options.length + 1}`,
                          value: createCheckboxOptionValue(),
                        },
                      ],
                    }
                    updateGroups(next)
                  }}
                >
                  <Plus data-icon="inline-start" />
                  {t('addAnswer')}
                </Button>
              </div>
            )}
          </div>
        )
      })}

      <Button type="button" variant="outline-primary" onClick={() => append(createDefaultGroup(groups.length))}>
        <Plus data-icon="inline-start" />
        {t('addCheckboxGroup')}
      </Button>
    </div>
  )
}
