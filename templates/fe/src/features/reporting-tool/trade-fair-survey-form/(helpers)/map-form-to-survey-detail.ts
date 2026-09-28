import type { CheckboxGroup, Question, QuestionMetadata, QuestionOption, QuestionType, SurveyDetail } from "@/features/reporting-tool/(helpers)/survey-detail-type";
import type { QuestionDto, TradeFairSurveyFormDto } from "./trade-fair-survey-form-schema";

const mapMetadata = (metadata: QuestionDto['metadata']): QuestionMetadata | undefined => {
  if (!metadata) return undefined;

  const rawOptions = metadata.options ?? [];
  const options = rawOptions.every(option => 'options' in option)
    ? rawOptions.map(option => ({
        label: option.label || '',
        options: ('options' in option ? option.options : []).map(child => ({
          label: child.label || '',
          value: child.value || '',
        })),
      })) as CheckboxGroup[]
    : rawOptions
        .filter((option): option is QuestionOption => 'value' in option)
        .map(option => ({
          label: option.label || '',
          value: option.value || '',
        }));

  return {
    ...metadata,
    options,
  };
};

export const mapQuestionDtoToQuestion = (dto: QuestionDto): Question => {
  return {
    id: dto.id || 'preview-question-id',
    groupId: 'preview-group-id',
    field_key: dto.field_key,
    content: dto.content || '',
    type: (dto.type || 'SHORT_TEXT') as QuestionType,
    position: dto.position || 0,
    isRequired: !!dto.isRequired,
    isDisable: !!dto.isDisable,
    placeholder: dto.placeholder || undefined,
    metadata: mapMetadata(dto.metadata),
    createdBy: '',
    updatedBy: '',
    createdAt: {},
    updatedAt: {},
  };
};


export const mapFormDtoToSurveyDetail = (formValues: TradeFairSurveyFormDto): SurveyDetail => {
  return {
    id: 'preview-temp-id',
    name: formValues.name || '',
    createdBy: '',
    updatedBy: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    steps: (formValues.steps || []).map((step, stepIndex) => ({
      id: step.id || `step-${stepIndex}`,
      surveyId: 'preview-temp-id',
      title: step.title || '',
      position: step.position ?? stepIndex,
      createdBy: '',
      updatedBy: '',
      createdAt: {},
      updatedAt: {},
      groups: (step.groups || []).map((group, groupIndex) => ({
        id: group.id || `group-${groupIndex}`,
        stepId: step.id || `step-${stepIndex}`,
        title: group.title || '',
        subTitle: group.subTitle,
        position: group.position ?? groupIndex,
        isDisable: !!group.isDisable,
        createdBy: '',
        updatedBy: '',
        createdAt: {},
        updatedAt: {},
        questions: (group.questions || []).map((q, qIndex) => ({
          id: q.id || `q-${qIndex}`,
          groupId: group.id || `group-${groupIndex}`,
          field_key: q.field_key,
          content: q.content || '',
          type: (q.type || 'SHORT_TEXT') as any,
          position: q.position ?? qIndex,
          isRequired: !!q.isRequired,
          isDisable: !!q.isDisable,
          placeholder: q.placeholder || undefined,
          metadata: mapMetadata(q.metadata),
          createdBy: '',
          updatedBy: '',
          createdAt: {},
          updatedAt: {},
        })),
      })),
    })),
  };
};
