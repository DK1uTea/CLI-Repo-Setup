import { useFormContext, useFieldArray, useWatch } from 'react-hook-form'
import { QuestionDto } from '../(helpers)/trade-fair-survey-form-schema'
import { QuestionType } from '@/features/reporting-tool/(helpers)/survey-detail-type'

export const TYPES_WITHOUT_PLACEHOLDER: QuestionType[] = [
  'TOGGLE',
  'RATING',
  'SINGLE_CHOICE',
  'MULTIPLE_CHOICE',
  'CHECKBOX_GROUP',
  'YES_NO'
]

export const TYPES_WITH_OPTIONS: QuestionType[] = [
  'SINGLE_CHOICE',
  'MULTIPLE_CHOICE',
  'DROPDOWN',
  'MULTI_SELECT_DROPDOWN',
  'DROPDOWN_ADD_ON'
]

export function useQuestionForm() {
  const { control, formState: { errors }, setValue, register } = useFormContext<QuestionDto>()

  const typeValue = useWatch({
    control,
    name: 'type'
  }) as QuestionType

  const { fields, append, remove, move, replace, insert } = useFieldArray({
    control,
    name: 'metadata.options' as any
  })

  const showOptions = TYPES_WITH_OPTIONS.includes(typeValue)
  const showPlaceholder = !TYPES_WITHOUT_PLACEHOLDER.includes(typeValue)

  const handleTypeChange = (newType: QuestionType) => {
    setValue('type', newType, { shouldDirty: true, shouldValidate: true })

    if (TYPES_WITHOUT_PLACEHOLDER.includes(newType)) {
      setValue('placeholder', null)
    }

    if (newType === 'CHECKBOX_GROUP') {
      const defaultGroups = [
        {
          label: 'Group 1',
          options: [
            { label: 'Option 1', value: createCheckboxOptionValue() },
            { label: 'Option 2', value: createCheckboxOptionValue() }
          ]
        }
      ]
      setValue('metadata', { options: defaultGroups }, { shouldDirty: true, shouldValidate: true })
      replace(defaultGroups)
    } else if (TYPES_WITH_OPTIONS.includes(newType)) {
      if (!fields || fields.length === 0) {
        const defaultOptions = [
          { label: 'Option 1', value: 'option_1' },
          { label: 'Option 2', value: 'option_2' }
        ]
        setValue('metadata', { options: defaultOptions })
        replace(defaultOptions)
      }
    } else if (newType === 'INPUT_NUMBER') {
      setValue('metadata', { min: null, max: null })
    } else {
      setValue('metadata', null)
    }
  }

  const handleAddOption = () => {
    let maxIdx = 0
    fields.forEach((f: any) => {
      const match = f.label?.match(/(?:Answer|Option)\s+(\d+)/i)
      if (match) {
        maxIdx = Math.max(maxIdx, parseInt(match[1], 10))
      }
    })
    
    const nextIdx = maxIdx > 0 ? maxIdx + 1 : fields.length + 1
    append({
      label: `Option ${nextIdx}`,
      value: `option_${nextIdx}`
    })
  }

  return {
    control,
    errors,
    setValue,
    register,
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
  }
}

export const createCheckboxOptionValue = () =>
  `checkbox_${typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(36).slice(2)}`}`
