import { useTranslations } from "next-intl";
import { QuestionDto, TradeFairSurveyFormDto } from "../../../(helpers)/trade-fair-survey-form-schema";
import { getQuestionTypeTranslation } from "../../../(helpers)/survey-question-type-helper";
import { QuestionType } from "@/features/reporting-tool/(helpers)/survey-detail-type";
import { Button } from "@/shared/components/ui/button";
import { Switch } from "@/shared/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import EditQuestionDialog from "./edit-question-dialog";
import { useQuestionAction } from "../../../(hooks)/use-question-action";
import { cn } from "@/lib/utils";
import DisableQuestionAlertDialog from "./disable-question-alert-dialog";

type Props = {
  question: QuestionDto;
  stepPosition: number;
  groupPosition: number;
  questionIndex: number;
}

const QuestionRow = ({ question, stepPosition, groupPosition, questionIndex }: Props) => {
  const t = useTranslations('reportingTool');
  const [isEditQuestionOpen, setIsEditQuestionOpen] = useState(false);
  const [isDisableAlertOpen, setIsDisableAlertOpen] = useState(false);
  const { updateQuestion, deleteQuestion } = useQuestionAction();
  const { control, setValue } = useFormContext<TradeFairSurveyFormDto>();

  const handleEditQuestion = (updatedQuestion: QuestionDto) => {
    updateQuestion(stepPosition, groupPosition, questionIndex, updatedQuestion);
  };

  const TYPES_WITH_OPTIONS = [
    'SINGLE_CHOICE',
    'MULTIPLE_CHOICE',
    'DROPDOWN',
    'MULTI_SELECT_DROPDOWN',
    'DROPDOWN_ADD_ON'
  ];

  return (
    <div className={cn("flex items-center justify-between p-3 border-b mx-3 transition-opacity duration-200", stepPosition === 0 ? "pl-4" : "pl-10", question.isDisable && "opacity-50")}>
      <div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">{question.content}</span>
          {question.isRequired && (
            <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary shrink-0 select-none">
              {t('tradeFairSurveyForm.requiredBadge')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">{getQuestionTypeTranslation(question.type as QuestionType, t, { scoped: true }).label}</span>
          {TYPES_WITH_OPTIONS.includes(question.type) && question.metadata?.options && (
            <span className="flex justify-center w-4 h-4 items-center bg-gray-500/10 rounded-full text-xs text-muted-foreground">{question.metadata.options.length}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {!(stepPosition === 0 && question.field_key) && (
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="text-destructive hover:bg-destructive/10 h-8 w-8"
            onClick={() => deleteQuestion(stepPosition, groupPosition, questionIndex)}
            tooltip={t('tradeFairSurveyForm.deleteQuestionTooltip')}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        {stepPosition === 0 && question.field_key && (
          <Controller
            control={control}
            name={`steps.${stepPosition}.groups.${groupPosition}.questions.${questionIndex}.isDisable`}
            render={({ field }) => (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div onClick={(e) => e.stopPropagation()} className="flex items-center px-2">
                    <Switch
                      checked={!field.value}
                      onCheckedChange={(checked) => {
                        if (!checked) {
                          setIsDisableAlertOpen(true);
                        } else {
                          field.onChange(false);
                        }
                      }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {t('tradeFairSurveyForm.hideFieldTooltip')}
                </TooltipContent>
              </Tooltip>
            )}
          />
        )}
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => setIsEditQuestionOpen(true)}
          className="h-8 w-8"
          tooltip={t('tradeFairSurveyForm.editQuestion')}
        >
          <Pencil className="h-4 w-4 text-primary" />
        </Button>
      </div>
      <EditQuestionDialog
        open={isEditQuestionOpen}
        onClose={() => setIsEditQuestionOpen(false)}
        onSave={handleEditQuestion}
        question={question}
      />
      {isDisableAlertOpen && (
        <DisableQuestionAlertDialog
          open={isDisableAlertOpen}
          questionName={question.content}
          onClose={() => setIsDisableAlertOpen(false)}
          onConfirm={() => {
            setValue(
              `steps.${stepPosition}.groups.${groupPosition}.questions.${questionIndex}.isDisable`,
              true,
              { shouldDirty: true }
            );
            setIsDisableAlertOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default QuestionRow;