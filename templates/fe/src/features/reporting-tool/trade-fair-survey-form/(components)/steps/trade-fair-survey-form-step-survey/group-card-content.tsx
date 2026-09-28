'use client';

import { useFormContext, useFormState, Controller } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useQuestionAction } from "../../../(hooks)/use-question-action";
import { translateErrorMessage } from "@/lib/field-error";
import { cn } from "@/lib/utils";
import { GripVertical, PlusIcon } from "lucide-react";
import QuestionRow from "./question-row";
import { Button } from "@/shared/components/ui/button";
import AddQuestionDialog from "./add-question-dialog";
import { GroupDto, TradeFairSurveyFormDto } from "../../../(helpers)/trade-fair-survey-form-schema";
import { Input } from "@/shared/components/ui/input";

type GroupCardContentProps = {
  group: GroupDto;
  stepPosition: number;
};

export const GroupCardContent = ({ group, stepPosition }: GroupCardContentProps) => {
  const t = useTranslations('reportingTool');
  const { control } = useFormContext<TradeFairSurveyFormDto>();
  const { errors } = useFormState<TradeFairSurveyFormDto>({ control });

  const { addQuestion, moveQuestion } = useQuestionAction();
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);

  const questionsError = errors.steps?.[stepPosition]?.groups?.[group.position]?.questions;
  const subtitleError = errors.steps?.[stepPosition]?.groups?.[group.position]?.subTitle;

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [draggableIndex, setDraggableIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    if (dragIndex !== null && dragIndex !== index) {
      moveQuestion(stepPosition, group.position, dragIndex, index);
      setDragIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDraggableIndex(null);
  };

  const handleAddQuestion = (question: any) => {
    addQuestion(stepPosition, group.position, question);
  };

  return (
    <>
      {questionsError?.message && (
        <div className="px-4 py-2">
          <p className="text-red-500 text-xs font-medium">{translateErrorMessage(questionsError.message)}</p>
        </div>
      )}
      <div className="p-3">
        <Controller
          control={control}
          name={`steps.${stepPosition}.groups.${group.position}.subTitle`}
          render={({ field }) => (
            <Input
              {...field}
              value={field.value ?? ""}
              placeholder={t("tradeFairSurveyForm.groupSubtitlePlaceholder")}
              error={subtitleError?.message}
              className="bg-background"
            />
          )}
        />
      </div>
      {(!group.questions || group.questions.length === 0) && (
        <div className="px-4 py-2">
          <p className="text-muted-foreground/50">{t('tradeFairSurveyForm.noQuestionsYet')}</p>
        </div>
      )}
      <div className="flex flex-col">
        {[...group.questions].sort((a, b) => a.position - b.position).map((question, idx) => (
          <div
            key={question.id || question.field_key || idx}
            className={cn(
              "relative transition-opacity",
              dragIndex === idx ? "opacity-30" : ""
            )}
            draggable={stepPosition > 0 && draggableIndex === idx}
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragEnter={(e) => handleDragEnter(e, idx)}
            onDragOver={(e) => e.preventDefault()}
            onDragEnd={handleDragEnd}
          >
            {stepPosition > 0 && (
              <div
                className="absolute left-3.5 top-5 z-10 cursor-grab p-1 active:cursor-grabbing hover:bg-slate-100 rounded"
                onMouseEnter={() => setDraggableIndex(idx)}
                onMouseLeave={() => setDraggableIndex(null)}
              >
                <GripVertical size={16} className="text-muted-foreground/40" />
              </div>
            )}
            <QuestionRow
              question={question}
              stepPosition={stepPosition}
              groupPosition={group.position}
              questionIndex={idx}
            />
          </div>
        ))}
      </div>
      <Button
        variant="ghost"
        className="text-sm text-primary mt-2"
        onClick={() => setIsAddQuestionOpen(true)}
      >
        {t('questionForm.addQuestion')} <PlusIcon data-icon="inline-end" />
      </Button>
      <AddQuestionDialog
        open={isAddQuestionOpen}
        onClose={() => setIsAddQuestionOpen(false)}
        onSave={handleAddQuestion}
      />
    </>
  );
};
