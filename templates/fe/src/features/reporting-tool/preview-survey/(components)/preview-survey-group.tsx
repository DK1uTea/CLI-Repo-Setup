'use client';

import type { Group } from '../../(helpers)/survey-detail-type';
import { QuestionField } from './(fields)/question-field';

type PreviewSurveyGroupProps = {
  stepId: string;
  group: Group;
};

export function PreviewSurveyGroup({ stepId, group }: PreviewSurveyGroupProps) {
  return (
    <div className="flex flex-col gap-4 ">
      {group.title && (
        <p className="font-semibold text-2xl">{group.title}</p>
      )}
      <div className="flex flex-col gap-4 rounded-[32px] p-7 bg-card">
        {group.subTitle && <p className="text-xl font-semibold">{group.subTitle}</p>}
        {group.questions
          .filter((question) => !question.isDisable)
          .map((question) => (
            <QuestionField key={question.id} stepId={stepId} question={question} />
          ))}
      </div>
    </div>
  );
}
