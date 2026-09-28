import { QuestionType } from "../../(helpers)/survey-detail-type";

export interface QuestionTypeTranslation {
  label: string;
  description: string;
}

/**
 * Returns the translation keys for a given question type's label and description.
 * Useful when you want to handle translation manually or check the translation keys.
 */
export const getQuestionTypeTranslationKeys = (type: QuestionType, options?: { scoped?: boolean }) => {
  const prefix = options?.scoped ? 'questionTypes' : 'reportingTool.questionTypes';
  return {
    labelKey: `${prefix}.${type}.label`,
    descriptionKey: `${prefix}.${type}.description`,
  };
};

/**
 * Translates a given question type's label and description using the provided next-intl translation function `t`.
 * 
 * @param type The question type
 * @param t The translate function from useTranslations (next-intl)
 * @param options Config options:
 *        - `scoped` (default: `false`): Set to `true` if `t` is already scoped to `reportingTool` (e.g. `useTranslations('reportingTool')`).
 */
export const getQuestionTypeTranslation = (
  type: QuestionType,
  t: any,
  options?: { scoped?: boolean }
): QuestionTypeTranslation => {
  const { labelKey, descriptionKey } = getQuestionTypeTranslationKeys(type, options);
  return {
    label: t(labelKey),
    description: t(descriptionKey),
  };
};
