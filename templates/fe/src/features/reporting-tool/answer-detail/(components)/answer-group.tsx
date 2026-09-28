'use client';

import { useTranslations } from 'next-intl';
import { formatDate } from '@/lib/date-utils';
import { useDateFormat } from '@/shared/stores/use-user-store';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/shared/components/ui/table';
import { Group, Question } from '../../(helpers)/survey-detail-type';
import { getCheckboxGroups, getQuestionOptions } from '../../(helpers)/survey-question-option-helper';
import { FormData } from '../../(helpers)/trade-fair-answer-type';
import { AnswerDetailContact } from '../../(helpers)/trade-fair-answer-detail-type';

type Props = {
  group: Group;
  stepId: string;
  formData: FormData;
  contact?: AnswerDetailContact;
};

const CONTACT_FIELD_BY_POSITION: Record<number, string> = {
  0: 'salutation',
  1: 'first_name',
  2: 'last_name',
  3: 'company',
  4: 'function',
  5: 'street',
  6: 'zip',
  7: 'city',
  8: 'phone',
  9: 'email',
};

const AnswerGroup = ({ group, stepId, formData, contact }: Props) => {
  const t = useTranslations('reportingTool.answerDetail');
  const dateFormat = useDateFormat();

  const sortedQuestions = [...(group.questions || [])]
    .filter((question) => !question.isDisable)
    .sort((a, b) => a.position - b.position);
  const contactValues: Record<string, string | undefined> = contact
    ? {
        salutation: contact.salutation,
        first_name: contact.firstName,
        last_name: contact.lastName,
        company: contact.company,
        function: contact.function,
        street: contact.streetAndHouseNumber,
        zip: contact.postalCode,
        city: contact.city,
        phone: contact.phoneNumber,
        email: contact.email,
      }
    : {};

  const formatAnswerValue = (question: Question, value: any) => {
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
      return '';
    }

    if (question.type === 'YES_NO') {
      const isYes = typeof value === 'boolean'
        ? value
        : String(value).toLowerCase() === 'yes' || String(value).toLowerCase() === 'true';
      return isYes ? t('yes') : t('no');
    }

    if (question.type === 'CHECKBOX_GROUP') {
      const selected = new Set(Array.isArray(value) ? value : [value]);
      return getCheckboxGroups(question.metadata)
        .map((checkboxGroup) => {
          const labels = checkboxGroup.options
            .filter((option) => selected.has(option.value))
            .map((option) => option.label);
          return labels.length > 0 ? `${checkboxGroup.label}: ${labels.join(', ')}` : '';
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
    <div className="flex flex-col gap-3">
      <h3 className="font-semibold">
        {group.title}
      </h3>
      <div className="border rounded-2xl overflow-hidden bg-card">
        <Table>
          <TableBody>
            {sortedQuestions.map((question) => {
              const fieldKey =
                question.field_key ??
                question.fieldKey ??
                (contact ? CONTACT_FIELD_BY_POSITION[question.position] : undefined);
              const hasContactField =
                !!fieldKey && Object.prototype.hasOwnProperty.call(contactValues, fieldKey);
              const answer = hasContactField
                ? contactValues[fieldKey]
                : formData[stepId]?.[question.id];
              const displayAnswer = formatAnswerValue(question, answer);

              return (
                <TableRow key={question.id} className="h-12 hover:bg-transparent">
                  <TableCell className="w-65 min-w-65 max-w-65 border-r px-5 py-3 font-medium whitespace-normal">
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
};

export default AnswerGroup;
