'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  tradeFairSurveyFormSchema,
  type TradeFairSurveyFormDto,
  type StepDto,
} from '../(helpers)/trade-fair-survey-form-schema';
import { useTradeFairSurveyActions } from './use-trade-fair-survey-action';
import { DEFAULT_TRADE_FAIR_SURVEY_STEPS } from '../(helpers)/trade-fair-survey-form-config';

export function useTradeFairSurveyForm(defaultValues?: Partial<TradeFairSurveyFormDto>) {
  const actions = useTradeFairSurveyActions();

  const mergeFieldKeys = (stepsList: StepDto[]): StepDto[] => {
    const defaultKeys = new Map<string, string>();
    DEFAULT_TRADE_FAIR_SURVEY_STEPS.forEach((step) => {
      step.groups?.forEach((group) => {
        group.questions?.forEach((q) => {
          if (q.field_key) {
            defaultKeys.set(q.content, q.field_key);
          }
        });
      });
    });

    return stepsList.map((step) => ({
      ...step,
      groups: (step.groups || []).map((group) => ({
        ...group,
        questions: (group.questions || []).map((q) => {
          const matchedFieldKey = defaultKeys.get(q.content);
          return {
            ...q,
            field_key: q.field_key || matchedFieldKey || null,
          };
        }),
      })),
    }));
  };

  const ensureIds = (stepsList: StepDto[]): StepDto[] => {
    const generateUUID = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    return stepsList.map((step) => ({
      ...step,
      id: step.id || generateUUID(),
      groups: (step.groups || []).map((group) => ({
        ...group,
        id: group.id || generateUUID(),
        questions: (group.questions || []).map((q) => ({
          ...q,
          id: q.id || generateUUID(),
        })),
      })),
    }));
  };

  const initialSteps = defaultValues?.steps
    ? ensureIds(mergeFieldKeys(defaultValues.steps))
    : ensureIds(DEFAULT_TRADE_FAIR_SURVEY_STEPS);

  const methods = useForm<TradeFairSurveyFormDto>({
    resolver: zodResolver(tradeFairSurveyFormSchema),
    defaultValues: {
      name: '',
      ...defaultValues,
      steps: initialSteps,
    },
    mode: 'onChange',
  });

  const originalReset = methods.reset;
  methods.reset = (values, keepStateOptions) => {
    const updatedValues = { ...values } as Partial<TradeFairSurveyFormDto>;
    if (updatedValues?.steps) {
      updatedValues.steps = ensureIds(mergeFieldKeys(updatedValues.steps));
    }
    originalReset(updatedValues, keepStateOptions);
  };

  return { methods, ...actions };
}
