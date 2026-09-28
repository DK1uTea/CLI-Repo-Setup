'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { parseAsString, useQueryState } from 'nuqs';
import { getValidationMessage } from '@/lib/field-error';
import {
  STEP_FIELDS,
  type TradeFairEventFormDto,
} from '../(helpers)/trade-fair-event-form-schema';
import { useAddSurveyToEvent } from '@/features/reporting-tool/(hooks)/(survey-hooks)/use-add-survey-to-event';

function scrollToField(field: keyof TradeFairEventFormDto) {
  const el =
    document.querySelector<HTMLElement>(`[data-field="${field}"]`) ??
    document.querySelector<HTMLElement>(`[name="${field}"]`);
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export function useSubmitStepSurvey() {
  const methods = useFormContext<TradeFairEventFormDto>();
  const t = useTranslations('reportingTool.tradeFairEventForm.survey');
  const [id] = useQueryState('id', parseAsString);

  const { addSurveyToEvent, isAdding } = useAddSurveyToEvent(id || '');

  const submit = async (): Promise<boolean> => {
    const valid = await methods.trigger(STEP_FIELDS.survey);

    if (!valid) {
      const firstErrorField = STEP_FIELDS.survey.find(
        (field) => methods.getFieldState(field).error,
      );

      if (firstErrorField) {
        const rawError = methods.getFieldState(firstErrorField).error;
        const message =
          rawError?.message === 'fieldErrors.required'
            ? getValidationMessage('fieldErrors.required')
            : rawError?.message ?? getValidationMessage('fieldErrors.required');

        toast.error(`${t('fieldLabels.surveys')}: ${message}`);
        scrollToField(firstErrorField);
      }

      return false;
    }

    if (id) {
      try {
        const surveys = methods.getValues('surveys') || [];
        await addSurveyToEvent({ surveys });
      } catch (error) {
        console.error('Adding survey to event failed:', error);
        return false;
      }
    }

    return true;
  };

  return { submit, isPending: isAdding };
}
