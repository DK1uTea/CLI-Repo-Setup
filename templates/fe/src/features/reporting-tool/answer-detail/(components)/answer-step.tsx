'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Step } from "../../(helpers)/survey-detail-type";
import { FormData } from "../../(helpers)/trade-fair-answer-type";
import { AnswerDetailContact } from "../../(helpers)/trade-fair-answer-detail-type";
import AnswerGroup from "./answer-group";

type Props = {
  step: Step;
  formData: FormData;
  contact?: AnswerDetailContact;
};

const AnswerStep = ({ step, formData, contact }: Props) => {
  const sortedGroups = [...(step.groups || [])]
    .filter(
      (group) =>
        !group.isDisable && group.questions?.some((question) => !question.isDisable),
    )
    .sort((a, b) => a.position - b.position);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{step.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {sortedGroups.map((group) => (
          <AnswerGroup
            key={group.id}
            group={group}
            stepId={step.id}
            formData={formData}
            contact={contact}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default AnswerStep;
