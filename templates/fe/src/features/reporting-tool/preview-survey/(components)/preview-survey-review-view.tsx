'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { PenLine } from 'lucide-react';
import type { Question } from '../../(helpers)/survey-detail-type';
import { getCheckboxGroups, getQuestionOptions } from '../../(helpers)/survey-question-option-helper';
import { usePreviewSurveyStore } from '../(stores)/use-preview-survey-store';
import { usePreviewSurveyActions } from '../(hooks)/use-preview-survey-actions';
import { Button } from '@/shared/components/ui/button';
import { formatDate } from '@/lib/date-utils';
import { useDateFormat } from '@/shared/stores/use-user-store';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/shared/components/ui/table';

export function PreviewSurveyReviewView() {
  const t = useTranslations('reportingTool.previewSurvey');
  const dateFormat = useDateFormat();
  const { surveyDetail } = usePreviewSurveyStore();
  const { getValues } = useFormContext();
  const { goToStep } = usePreviewSurveyActions();
  const values = getValues();

  // Get original steps (excluding review step)
  const steps = [...(surveyDetail?.steps || [])].sort((a, b) => a.position - b.position);

  const formatAnswerValue = (question: Question, value: any) => {
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
      return '';
    }

    if (question.type === 'YES_NO') {
      return value ? 'Yes' : 'No';
    }

    if (question.type === 'CHECKBOX_GROUP') {
      const selected = new Set(Array.isArray(value) ? value : [value]);
      return getCheckboxGroups(question.metadata)
        .map((group) => {
          const labels = group.options
            .filter((option) => selected.has(option.value))
            .map((option) => option.label);
          return labels.length > 0 ? `${group.label}: ${labels.join(', ')}` : '';
        })
        .filter(Boolean)
        .join('\n');
    }

    if (question.type === 'MULTIPLE_CHOICE') {
      const arr = Array.isArray(value) ? value : [value];
      const options = getQuestionOptions(question.metadata);
      const labels = arr.map(
        (val) => options.find((opt) => opt.value === val)?.label ?? val
      );
      return labels.join(', ');
    }

    if (question.type === 'SINGLE_CHOICE' || question.type === 'DROPDOWN' || question.type === 'DROPDOWN_ADD_ON') {
      return getQuestionOptions(question.metadata).find((opt) => opt.value === value)?.label ?? String(value);
    }

    if (question.type === 'DATE') {
      return formatDate(value, dateFormat);
    }

    return String(value);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6">
        {steps.map((step) => {
          const stepQuestions = step.groups
            .filter((g) => !g.isDisable)
            .flatMap((g) => g.questions.filter((q) => !q.isDisable));

          return (
            <div key={step.id} className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-2xl">
                  {step.title}
                </p>
                <Button
                  variant="ghost"
                  onClick={() => goToStep(step.id)}
                  className="gap-2 text-primary hover:text-primary/80"
                >
                  <PenLine />
                  {t('edit')}
                </Button>
              </div>
              <div className="border rounded-2xl overflow-hidden bg-card">
                <Table>
                  <TableBody>
                    {stepQuestions.map((question) => {
                      const answer = values[step.id]?.[question.id];
                      const displayAnswer = formatAnswerValue(question, answer);

                      return (
                        <TableRow key={question.id} className="h-12 hover:bg-transparent">
                          <TableCell className="w-50 border-r px-5 py-3 font-medium">
                            {question.content}
                          </TableCell>
                          <TableCell className="px-5 py-3 whitespace-pre-line font-light">
                            {displayAnswer || "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
