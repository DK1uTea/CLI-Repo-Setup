import type {
  CheckboxGroup,
  QuestionMetadata,
  QuestionOption,
} from './survey-detail-type';

export const isCheckboxGroup = (
  option: QuestionOption | CheckboxGroup,
): option is CheckboxGroup =>
  'options' in option && Array.isArray(option.options);

export const getQuestionOptions = (
  metadata?: QuestionMetadata,
): QuestionOption[] =>
  (metadata?.options ?? []).filter(
    (option): option is QuestionOption => !isCheckboxGroup(option),
  );

export const getCheckboxGroups = (
  metadata?: QuestionMetadata,
): CheckboxGroup[] =>
  (metadata?.options ?? []).filter(isCheckboxGroup);
