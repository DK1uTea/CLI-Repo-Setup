import { z } from 'zod';
import { getValidationMessage } from '@/lib/field-error';
import { zBoolean, zDate, zEmail, zNumber, zPhone, zString } from '@/shared/schemas';
import { Question, Step, SurveyDetail } from '../../(helpers)/survey-detail-type';

export type DynamicFormValues = Record<string, Record<string, unknown>>;
export type SurveyStepFields = Record<string, readonly string[]>;
export type SurveyStepFieldPaths = Record<string, readonly `${string}.${string}`[]>;

const emptyValueToUndefined = (value: unknown) => (value === '' || value === null ? undefined : value);

const optionalEmail = () => z.union([z.literal(''), zEmail()]).optional();

const optionalDate = () =>
  z.preprocess(
    emptyValueToUndefined,
    z.union([z.undefined(), zDate()]),
  );

const requiredBoolean = () =>
  z.union([zBoolean(), z.undefined()]).superRefine((val, ctx) => {
    if (val === undefined) {
      ctx.addIssue({ code: 'custom' as const, message: getValidationMessage('fieldErrors.required') });
    }
  });

const requiredDate = () =>
  z.union([zDate(['required']), z.undefined()]).superRefine((val, ctx) => {
    if (val === undefined) {
      ctx.addIssue({ code: 'custom' as const, message: getValidationMessage('fieldErrors.required') });
    }
  });

export function buildFieldSchema(question: Question) {
  let schema: z.ZodTypeAny;

  switch (question.type) {
    case 'EMAIL':
      schema = question.isRequired ? zString(['required']).pipe(zEmail()) : optionalEmail();
      break;
    case 'PHONE_NUMBER':
      schema = zPhone(question.isRequired ? ['required'] : []);
      break;
    case 'YES_NO':
      schema = question.isRequired ? requiredBoolean() : zBoolean().optional();
      break;
    case 'TOGGLE':
      schema = zBoolean().optional();
      break;
    case 'RATING':
      schema = question.isRequired
        ? z.preprocess(
            emptyValueToUndefined,
            zNumber(['required', 'min:1', 'max:5'])
          )
        : z.preprocess(
            emptyValueToUndefined,
            z.union([z.undefined(), zNumber(['min:1', 'max:5'])]),
          );
      break;
    case 'SINGLE_CHOICE':
    case 'DROPDOWN':
    case 'DROPDOWN_ADD_ON':
      schema = zString(question.isRequired ? ['required'] : []);
      break;
    case 'MULTIPLE_CHOICE':
    case 'CHECKBOX_GROUP':
    case 'MULTI_SELECT_DROPDOWN':
      schema = question.isRequired
        ? z.array(zString()).min(1, getValidationMessage('fieldErrors.required'))
        : z.array(zString()).optional();
      break;
    case 'INPUT_NUMBER': {
      const rules: any[] = [];
      if (question.isRequired) {
        rules.push('required');
      }
      if (question.metadata?.min !== undefined && question.metadata?.min !== null) {
        rules.push(`min:${question.metadata.min}`);
      }
      if (question.metadata?.max !== undefined && question.metadata?.max !== null) {
        rules.push(`max:${question.metadata.max}`);
      }

      schema = question.isRequired
        ? z.preprocess(emptyValueToUndefined, zNumber(rules))
        : z.preprocess(
            emptyValueToUndefined,
            z.union([z.undefined(), zNumber(rules)]),
          );
      break;
    }
    case 'DATE':
      schema = question.isRequired
        ? z.preprocess(emptyValueToUndefined, requiredDate())
        : optionalDate();
      break;
    case 'SHORT_TEXT':
    case 'LONG_TEXT':
    default:
      schema = zString(question.isRequired ? ['required'] : []);
      break;
  }

  return schema;
}


function buildStepSchema(step: Step) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const group of step.groups) {
    if (group.isDisable) continue;
    for (const question of group.questions) {
      if (question.isDisable) continue;
      shape[question.id] = buildFieldSchema(question);
    }
  }

  return z.object(shape);
}

function getQuestionDefaultValue(question: Question) {
  switch (question.type) {
    case 'MULTIPLE_CHOICE':
    case 'CHECKBOX_GROUP':
    case 'MULTI_SELECT_DROPDOWN':
      return [];
    case 'YES_NO':
    case 'INPUT_NUMBER':
    case 'DATE':
    case 'RATING':
      return undefined;
    case 'TOGGLE':
      return false;
    case 'EMAIL':
    case 'PHONE_NUMBER':
    case 'SHORT_TEXT':
    case 'LONG_TEXT':
    case 'SINGLE_CHOICE':
    case 'DROPDOWN':
    case 'DROPDOWN_ADD_ON':
    default:
      return '';
  }
}

export function buildSurveySchema(survey: SurveyDetail) {
  const stepSchemas: Record<string, z.ZodTypeAny> = {};

  for (const step of survey.steps) {
    stepSchemas[step.id] = buildStepSchema(step);
  }

  return z.object(stepSchemas);
}

export function buildSurveyDefaultValues(survey: SurveyDetail): DynamicFormValues {
  const defaultValues: DynamicFormValues = {};

  for (const step of survey.steps) {
    defaultValues[step.id] = {};

    for (const group of step.groups) {
      if (group.isDisable) continue;
      for (const question of group.questions) {
        if (question.isDisable) continue;
        defaultValues[step.id][question.id] = getQuestionDefaultValue(question);
      }
    }
  }

  return defaultValues;
}

export function buildSurveyStepFields(survey: SurveyDetail): SurveyStepFields {
  const stepFields: Record<string, string[]> = {};

  for (const step of survey.steps) {
    stepFields[step.id] = step.groups
      .filter((group) => !group.isDisable)
      .flatMap((group) =>
        group.questions
          .filter((question) => !question.isDisable)
          .map((question) => question.id),
      );
  }

  return stepFields;
}

export function buildSurveyStepFieldPaths(survey: SurveyDetail): SurveyStepFieldPaths {
  const stepFieldPaths: Record<string, `${string}.${string}`[]> = {};

  for (const step of survey.steps) {
    stepFieldPaths[step.id] = step.groups
      .filter((group) => !group.isDisable)
      .flatMap((group) =>
        group.questions
          .filter((question) => !question.isDisable)
          .map((question) => `${step.id}.${question.id}` as const),
      );
  }

  return stepFieldPaths;
}
