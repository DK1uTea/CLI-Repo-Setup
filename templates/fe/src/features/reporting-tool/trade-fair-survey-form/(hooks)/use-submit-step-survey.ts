'use client';

import { parseAsString, useQueryState } from 'nuqs';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { translateErrorMessage } from '@/lib/field-error';
import {
  STEP_FIELDS,
  type TradeFairSurveyFormDto,
} from '../(helpers)/trade-fair-survey-form-schema';
import { useCreateSurvey } from './use-create-survey';
import { useUpdateSurvey } from './use-update-survey';

const getFirstErrorMessage = (errors: any): string | undefined => {
  if (!errors) return undefined;
  if (typeof errors.message === 'string') return errors.message;

  if (Array.isArray(errors)) {
    for (const err of errors) {
      const msg = getFirstErrorMessage(err);
      if (msg) return msg;
    }
  } else if (typeof errors === 'object') {
    for (const key of Object.keys(errors)) {
      const msg = getFirstErrorMessage(errors[key]);
      if (msg) return msg;
    }
  }
  return undefined;
};

export function useSubmitStepSurvey() {
  const methods = useFormContext<TradeFairSurveyFormDto>();
  const [surveyId, setSurveyId] = useQueryState('id', parseAsString);
  const t = useTranslations('reportingTool.tradeFairSurveyForm');
  const { mutateAsync: createSurvey, isPending: isCreating } = useCreateSurvey();
  const { mutateAsync: updateSurvey, isPending: isUpdating } = useUpdateSurvey(surveyId || '');

  const isPending = isCreating || isUpdating;

  const submit = async (): Promise<string | null> => {
    const valid = await methods.trigger(STEP_FIELDS.survey);

    if (!valid) {
      const firstErrorField = STEP_FIELDS.survey.find(
        (field) => methods.getFieldState(field).error
      );

      if (firstErrorField) {
        const rawError = methods.getFieldState(firstErrorField).error;
        const message = translateErrorMessage(getFirstErrorMessage(rawError) || 'fieldErrors.required');
        if (firstErrorField === 'name') {
          toast.error(`${t('surveyName')}: ${message}`);
        } else {
          toast.error(message);
        }
      }
      return null;
    }

    let activeId = surveyId;
    if (!activeId) {
      try {
        const values = methods.getValues();
        const response = await createSurvey(values);
        const newSurveyId = response.id;
        await setSurveyId(newSurveyId, { history: 'replace' });
        activeId = newSurveyId;
      } catch {
        return null;
      }
    } else {
      try {
        const values = methods.getValues();
        await updateSurvey(values);
      } catch {
        return null;
      }
    }

    return activeId;
  };

  return { submit, isPending };
}
