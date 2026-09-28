'use client';

import { useFormContext } from 'react-hook-form';
import { TradeFairSurveyFormDto, QuestionDto } from '../(helpers)/trade-fair-survey-form-schema';

export function useQuestionAction() {
  const { setValue, getValues } = useFormContext<TradeFairSurveyFormDto>();

  const generateUUID = () => {
    return typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2);
  };

  const addQuestion = (stepPosition: number, groupPosition: number, question: QuestionDto) => {
    const steps = getValues('steps') || [];
    if (stepPosition < 0 || stepPosition >= steps.length) return;

    const targetStep = steps[stepPosition];
    const groups = targetStep.groups || [];
    if (groupPosition < 0 || groupPosition >= groups.length) return;

    const targetGroup = groups[groupPosition];
    const questions = targetGroup.questions || [];
    const nextPosition = questions.length;

    const newQuestion = {
      ...question,
      id: question.id || generateUUID(),
      position: nextPosition,
      isDisable: question.isDisable ?? false,
    };

    const newGroups = [...groups];
    newGroups[groupPosition] = {
      ...targetGroup,
      questions: [...questions, newQuestion],
    };

    const newSteps = steps.map((step, idx) => {
      if (idx === stepPosition) {
        return {
          ...step,
          groups: newGroups,
        };
      }
      return step;
    });

    setValue('steps', newSteps, { shouldDirty: true });
  };

  const updateQuestion = (stepPosition: number, groupPosition: number, questionIndex: number, updatedQuestion: QuestionDto) => {
    const steps = getValues('steps') || [];
    if (stepPosition < 0 || stepPosition >= steps.length) return;

    const targetStep = steps[stepPosition];
    const groups = targetStep.groups || [];
    if (groupPosition < 0 || groupPosition >= groups.length) return;

    const targetGroup = groups[groupPosition];
    const questions = targetGroup.questions || [];
    if (questionIndex < 0 || questionIndex >= questions.length) return;

    const newQuestions = [...questions];
    newQuestions[questionIndex] = {
      ...updatedQuestion,
      id: updatedQuestion.id || questions[questionIndex].id || generateUUID(),
    };

    const newGroups = [...groups];
    newGroups[groupPosition] = {
      ...targetGroup,
      questions: newQuestions,
    };

    const newSteps = steps.map((step, idx) => {
      if (idx === stepPosition) {
        return {
          ...step,
          groups: newGroups,
        };
      }
      return step;
    });

    setValue('steps', newSteps, { shouldDirty: true });
  };

  const moveQuestion = (stepPosition: number, groupPosition: number, fromIndex: number, toIndex: number) => {
    const steps = getValues('steps') || [];
    if (stepPosition < 0 || stepPosition >= steps.length) return;

    const targetStep = steps[stepPosition];
    const groups = targetStep.groups || [];
    if (groupPosition < 0 || groupPosition >= groups.length) return;

    const targetGroup = groups[groupPosition];
    const questions = targetGroup.questions || [];
    if (fromIndex < 0 || fromIndex >= questions.length || toIndex < 0 || toIndex >= questions.length) return;

    const newQuestions = [...questions];
    const [moved] = newQuestions.splice(fromIndex, 1);
    newQuestions.splice(toIndex, 0, moved);

    // Recalculate positions
    const finalQuestions = newQuestions.map((q, idx) => ({
      ...q,
      position: idx,
    }));

    const newGroups = groups.map((group, idx) => {
      if (idx === groupPosition) {
        return {
          ...group,
          questions: finalQuestions,
        };
      }
      return group;
    });

    const newSteps = steps.map((step, idx) => {
      if (idx === stepPosition) {
        return {
          ...step,
          groups: newGroups,
        };
      }
      return step;
    });

    setValue('steps', newSteps, { shouldDirty: true });
  };

  const deleteQuestion = (stepPosition: number, groupPosition: number, questionIndex: number) => {
    const steps = getValues('steps') || [];
    if (stepPosition < 0 || stepPosition >= steps.length) return;

    const targetStep = steps[stepPosition];
    const groups = targetStep.groups || [];
    if (groupPosition < 0 || groupPosition >= groups.length) return;

    const targetGroup = groups[groupPosition];
    const questions = targetGroup.questions || [];
    if (questionIndex < 0 || questionIndex >= questions.length) return;

    const newQuestions = questions.filter((_, idx) => idx !== questionIndex).map((q, idx) => ({
      ...q,
      position: idx,
    }));

    const newGroups = [...groups];
    newGroups[groupPosition] = {
      ...targetGroup,
      questions: newQuestions,
    };

    const newSteps = steps.map((step, idx) => {
      if (idx === stepPosition) {
        return {
          ...step,
          groups: newGroups,
        };
      }
      return step;
    });

    setValue('steps', newSteps, { shouldDirty: true });
  };

  return {
    addQuestion,
    updateQuestion,
    moveQuestion,
    deleteQuestion,
  };
}
