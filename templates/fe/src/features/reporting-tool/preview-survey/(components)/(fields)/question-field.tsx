'use client';

import { useFormState } from 'react-hook-form';
import type { Question } from '../../../(helpers)/survey-detail-type';
import { TextField } from './text-field';
import { TextareaField } from './textarea-field';
import { SelectField } from './select-field';
import { ChoiceField } from './choice-field';
import { CheckboxField } from './checkbox-field';
import { DateField } from './date-field';
import { NumberField } from './number-field';

import { DropdownAddonField } from './dropdown-addon-field';
import { ToggleField } from './toggle-field';
import { MultiSelectDropdownField } from './multi-select-dropdown-field';
import { RatingField } from './rating-field';
import { CheckboxGroupField } from './checkbox-group-field';

type QuestionFieldProps = {
  stepId: string;
  question: Question;
};

export function QuestionField({ stepId, question }: QuestionFieldProps) {
  const { errors } = useFormState();
  const fieldName = `${stepId}.${question.id}`;
  const errorMsg = (errors[stepId] as Record<string, any>)?.[question.id]?.message;

  switch (question.type) {
    case 'TOGGLE':
      return <ToggleField fieldName={fieldName} question={question} errorMsg={errorMsg} />;

    case 'RATING':
      return <RatingField fieldName={fieldName} question={question} errorMsg={errorMsg} />;

    case 'MULTI_SELECT_DROPDOWN':
      return <MultiSelectDropdownField fieldName={fieldName} question={question} errorMsg={errorMsg} />;

    case 'LONG_TEXT':
      return <TextareaField fieldName={fieldName} question={question} errorMsg={errorMsg} />;

    case 'DROPDOWN':
      return <SelectField fieldName={fieldName} question={question} errorMsg={errorMsg} />;

    case 'DROPDOWN_ADD_ON':
      return <DropdownAddonField fieldName={fieldName} question={question} errorMsg={errorMsg} />;

    case 'SINGLE_CHOICE':
    case 'YES_NO':
      return <ChoiceField fieldName={fieldName} question={question} errorMsg={errorMsg} />;

    case 'MULTIPLE_CHOICE':
      return <CheckboxField fieldName={fieldName} question={question} errorMsg={errorMsg} />;

    case 'CHECKBOX_GROUP':
      return <CheckboxGroupField fieldName={fieldName} question={question} errorMsg={errorMsg} />;

    case 'DATE':
      return <DateField fieldName={fieldName} question={question} errorMsg={errorMsg} />;

    case 'INPUT_NUMBER':
      return <NumberField fieldName={fieldName} question={question} errorMsg={errorMsg} />;

    case 'EMAIL':
    case 'PHONE_NUMBER':
    case 'ADDRESS':
    case 'SHORT_TEXT':
    default:
      return <TextField fieldName={fieldName} question={question} errorMsg={errorMsg} />;
  }
}
