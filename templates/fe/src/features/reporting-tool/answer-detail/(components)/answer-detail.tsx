'use client';

import { AnswerDetail as AnswerDetailType } from '../../(helpers)/trade-fair-answer-detail-type';
import AnswerStep from './answer-step';

type Props = {
  answerDetail: AnswerDetailType;
};

const AnswerDetail = ({ answerDetail }: Props) => {
  const steps = [...(answerDetail.survey?.steps || [])]
    .filter((step) =>
      step.groups?.some(
        (group) => !group.isDisable && group.questions?.some((question) => !question.isDisable),
      ),
    )
    .sort((a, b) => a.position - b.position);

  return (
    <div className="flex flex-col gap-6">
      {steps.map((step) => (
        <AnswerStep
          key={step.id}
          step={step}
          formData={answerDetail.formData}
          contact={step.position === 0 ? answerDetail.contact : undefined}
        />
      ))}
    </div>
  );
};

export default AnswerDetail;
