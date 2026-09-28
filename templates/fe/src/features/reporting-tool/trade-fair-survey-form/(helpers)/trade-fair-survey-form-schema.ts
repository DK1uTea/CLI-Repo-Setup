import { z } from 'zod';
import { getValidationMessage } from '@/lib/field-error';
import { zBoolean, zString, zNumber } from '@/shared/schemas';
import type { StepName } from './trade-fair-survey-form-config';

export const QuestionOptionSchema = z.object({
  label: zString(['required']),
  value: zString(['required']),
});
export type QuestionOptionDto = z.infer<typeof QuestionOptionSchema>;

export const CheckboxGroupSchema = z.object({
  label: zString(['required']),
  options: z.array(QuestionOptionSchema).min(1, getValidationMessage('fieldErrors.required')),
});
export type CheckboxGroupDto = z.infer<typeof CheckboxGroupSchema>;

export const QuestionMetadataSchema = z.object({
  options: z.union([
    z.array(QuestionOptionSchema),
    z.array(CheckboxGroupSchema),
  ]).optional(),
  min: zNumber().optional().nullable(),
  max: zNumber().optional().nullable(),
}).optional().nullable();
export type QuestionMetadataDto = z.infer<typeof QuestionMetadataSchema>;

export const QuestionSchema = z.object({
  id: zString().optional(),
  field_key: zString().optional().nullable(),
  content: zString(['required']),
  type: zString(['required']),
  position: zNumber(['min:0']),
  isRequired: zBoolean(),
  isDisable: zBoolean(),
  placeholder: zString().optional().nullable(),
  metadata: QuestionMetadataSchema,
}).superRefine((question, ctx) => {
  if (question.type !== 'CHECKBOX_GROUP') return;

  const groups = question.metadata?.options;
  if (!groups || groups.length === 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['metadata', 'options'],
      message: getValidationMessage('fieldErrors.required'),
    });
    return;
  }

  const values = new Set<string>();
  groups.forEach((group, groupIndex) => {
    if (!('options' in group)) {
      ctx.addIssue({
        code: 'custom',
        path: ['metadata', 'options', groupIndex],
        message: getValidationMessage('fieldErrors.required'),
      });
      return;
    }

    group.options.forEach((option, optionIndex) => {
      if (values.has(option.value)) {
        ctx.addIssue({
          code: 'custom',
          path: ['metadata', 'options', groupIndex, 'options', optionIndex, 'value'],
          message: getValidationMessage('fieldErrors.required'),
        });
      }
      values.add(option.value);
    });
  });
});
export type QuestionDto = z.infer<typeof QuestionSchema>;

export const GroupSchema = z.object({
  id: zString().optional(),
  title: zString(['required']),
  subTitle: zString().optional().nullable(),
  position: zNumber(['min:0']),
  isDisable: zBoolean(),
  questions: z.array(QuestionSchema).min(1, getValidationMessage('fieldErrors.minQuestions')),
  _collapsed: z.boolean().optional(),
});
export type GroupDto = z.infer<typeof GroupSchema>;

export const StepSchema = z.object({
  id: zString().optional(),
  title: zString(['required']),
  position: zNumber(['min:0']),
  groups: z.array(GroupSchema).min(1, getValidationMessage('fieldErrors.minGroups')),
});
export type StepDto = z.infer<typeof StepSchema>;

export const tradeFairSurveyFormSchema = z.object({
  name: zString(['required']),
  steps: z.array(StepSchema),
});
export type TradeFairSurveyFormDto = z.infer<typeof tradeFairSurveyFormSchema>;

export const STEP_FIELDS: Record<StepName, readonly (keyof TradeFairSurveyFormDto)[]> = {
  survey: ['name', 'steps'],
  'assign-users': [],
};
