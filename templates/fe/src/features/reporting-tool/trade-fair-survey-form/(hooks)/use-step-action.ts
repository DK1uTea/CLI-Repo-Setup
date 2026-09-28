'use client';

import { useFormContext } from 'react-hook-form';
import { TradeFairSurveyFormDto, QuestionDto, StepDto } from '../(helpers)/trade-fair-survey-form-schema';
import { useTranslations } from 'next-intl';

export function useStepAction() {
  const { setValue, getValues } = useFormContext<TradeFairSurveyFormDto>();
  const t = useTranslations('reportingTool.tradeFairSurveyForm');

  const generateUUID = () => {
    return typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2);
  };

  const addStep = () => {
    const steps = getValues('steps') || [];
    const nextPosition = steps.length;
    const defaultQuestion: QuestionDto = {
      id: generateUUID(),
      content: t('question'),
      type: 'SHORT_TEXT',
      position: 0,
      isRequired: false,
      isDisable: false,
      placeholder: null,
      metadata: null,
    };
    const newStep: StepDto = {
      id: generateUUID(),
      title: `${t('step')} ${nextPosition + 1}`,
      position: nextPosition,
      groups: [
        {
          id: generateUUID(),
          title: `${t('group')} 1`,
          position: 0,
          isDisable: false,
          questions: [defaultQuestion],
        },
      ],
    };
    setValue('steps', [...steps, newStep], { shouldDirty: true });
  };

  const moveStep = (fromIndex: number, direction: 'up' | 'down') => {
    const steps = getValues('steps') || [];
    const targetIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (targetIndex < 1 || targetIndex >= steps.length) return;
    if (fromIndex < 1 || fromIndex >= steps.length) return;

    const newSteps = [...steps];
    // Swap
    const temp = newSteps[fromIndex];
    newSteps[fromIndex] = newSteps[targetIndex];
    newSteps[targetIndex] = temp;

    // Recalculate positions
    const finalSteps = newSteps.map((step, idx) => ({
      ...step,
      position: idx,
    }));

    setValue('steps', finalSteps, { shouldDirty: true });
  };

  const duplicateStep = (index: number) => {
    const steps = getValues('steps') || [];
    if (index < 0 || index >= steps.length) return;

    const duplicatedStep = JSON.parse(JSON.stringify(steps[index])) as StepDto;
    duplicatedStep.id = generateUUID();
    duplicatedStep.title = `${duplicatedStep.title} (${t('copySuffix')})`;
    if (duplicatedStep.groups) {
      duplicatedStep.groups = duplicatedStep.groups.map(group => ({
        ...group,
        id: generateUUID()
      }));
    }

    const newSteps = [...steps];
    // Insert immediately after original step
    newSteps.splice(index + 1, 0, duplicatedStep);

    // Recalculate positions
    const finalSteps = newSteps.map((step, idx) => ({
      ...step,
      position: idx,
    }));

    setValue('steps', finalSteps, { shouldDirty: true });
  };

  const deleteStep = (index: number) => {
    const steps = getValues('steps') || [];
    if (index < 0 || index >= steps.length) return;

    const newSteps = steps.filter((_, idx) => idx !== index);

    // Recalculate positions
    const finalSteps = newSteps.map((step, idx) => ({
      ...step,
      position: idx,
    }));

    setValue('steps', finalSteps, { shouldDirty: true });
  };

  return {
    addStep,
    moveStep,
    duplicateStep,
    deleteStep,
  };
}
