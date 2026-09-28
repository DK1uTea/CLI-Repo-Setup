'use client';

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { QuestionField } from "../../(components)/(fields)/question-field";
import type { Question } from "@/features/reporting-tool/(helpers)/survey-detail-type";
import { useTranslations } from "next-intl";
import { mapQuestionDtoToQuestion } from "@/features/reporting-tool/trade-fair-survey-form/(helpers)/map-form-to-survey-detail";
import { buildFieldSchema } from "../../(helpers)/build-dynamic-schema";
export { mapQuestionDtoToQuestion };

type PreviewQuestionDialogProps = {
  question: Question | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function PreviewQuestionDialog({ question, open, onOpenChange }: PreviewQuestionDialogProps) {
  const t = useTranslations('reportingTool.questionForm');

  const schema = z.object({
    'preview-step': z.object({
      [question?.id || 'preview-question']: question ? buildFieldSchema(question) : z.any()
    })
  });

  const methods = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      'preview-step': {
        [question?.id || 'preview-question']:
          question?.type === 'MULTIPLE_CHOICE' || question?.type === 'CHECKBOX_GROUP' || question?.type === 'MULTI_SELECT_DROPDOWN'
            ? []
            : question?.type === 'TOGGLE'
            ? false
            : question?.type === 'YES_NO' || question?.type === 'INPUT_NUMBER' || question?.type === 'DATE' || question?.type === 'RATING'
            ? undefined
            : ''
      }
    }
  });

  if (!question) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-2xl flex flex-col bg-background p-6 gap-3">
        <DialogHeader>
          <DialogTitle className="font-semibold text-xl">{t('previewQuestionTitle')}</DialogTitle>
        </DialogHeader>
        <div className="h-px bg-border -mx-6" />
        <FormProvider {...methods}>
          <div className="rounded-[48px] p-6 bg-card border border-border">
            <QuestionField stepId="preview-step" question={question} />
          </div>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
