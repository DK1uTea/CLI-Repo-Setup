// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────

export enum QuestionTypeEnum {
  // ── MOST USED ──────────────────────────────────────────────────
  SHORT_TEXT = 'SHORT_TEXT',
  LONG_TEXT = 'LONG_TEXT',
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  DROPDOWN = 'DROPDOWN',
  TOGGLE = 'TOGGLE',

  // ── BASIC ──────────────────────────────────────────────────────
  DATE = 'DATE',
  PHONE_NUMBER = 'PHONE_NUMBER',
  ADDRESS = 'ADDRESS',
  EMAIL = 'EMAIL',
  RATING = 'RATING',
  INPUT_NUMBER = 'INPUT_NUMBER',

  // ── ADVANCED ───────────────────────────────────────────────────
  MULTI_SELECT_DROPDOWN = 'MULTI_SELECT_DROPDOWN',
  DROPDOWN_ADD_ON = 'DROPDOWN_ADD_ON',
  CUSTOMER_LOOKUP = 'CUSTOMER_LOOKUP',
  YES_NO = 'YES_NO',

  // ── GROUPED INPUTS ─────────────────────────────────────────────
  CHECKBOX_GROUP = 'CHECKBOX_GROUP'
}

export type QuestionType = `${QuestionTypeEnum}`;
// ─────────────────────────────────────────────
// Nested types
// ─────────────────────────────────────────────

export type QuestionOption = {
  label: string;
  value: string;
};

export type CheckboxGroupOption = {
  label: string;
  value: string;
};

export type CheckboxGroup = {
  label: string;
  options: CheckboxGroupOption[];
};

export type QuestionMetadata = {
  options?: QuestionOption[] | CheckboxGroup[];
  min?: number | null;
  max?: number | null;
};

export type Question = {
  id: string;
  groupId: string;
  field_key?: string | null;
  fieldKey?: string | null;
  content: string;
  type: QuestionType;
  position: number;
  isRequired: boolean;
  isDisable: boolean;
  placeholder?: string;
  metadata?: QuestionMetadata;
  createdBy: string;
  updatedBy: string;
  createdAt: string | Record<string, never>;
  updatedAt: string | Record<string, never>;
};

export type Group = {
  id: string;
  stepId: string;
  title: string;
  subTitle?: string | null;
  position: number;
  isDisable: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string | Record<string, never>;
  updatedAt: string | Record<string, never>;
  questions: Question[];
};

export type Step = {
  id: string;
  surveyId: string;
  title: string;
  position: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string | Record<string, never>;
  updatedAt: string | Record<string, never>;
  groups: Group[];
};

export type SurveyDetail = {
  id: string;
  name: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  steps: Step[];
};
