import { AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/components/ui/accordion";
import { StepDto, TradeFairSurveyFormDto } from "../../../(helpers)/trade-fair-survey-form-schema";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";
import StepAccordionTrigger from "./step-accordion-trigger";
import StepAccordionContent from "./step-accordion-content";

type Props = {
  step: StepDto;
  isOpen: boolean;
}

const StepAccordion = ({ step, isOpen }: Props) => {
  const { control } = useFormContext<TradeFairSurveyFormDto>();
  const { errors } = useFormState<TradeFairSurveyFormDto>({ control });
  const t = useTranslations('reportingTool.tradeFairSurveyForm');
  const watchVal = useWatch<TradeFairSurveyFormDto>();
  const steps = watchVal.steps || [];
  const isFirstMovableStep = step.position === 1;
  const isLastStep = step.position === steps.length - 1;

  const groupCount = step.groups?.length || 0;
  const questionCount = step.groups?.reduce((sum, g) => sum + (g.questions?.length || 0), 0) || 0;
  const subtitle = `${t('groupsCount', { count: groupCount })} • ${t('questionsCount', { count: questionCount })}`;

  const stepError = errors.steps?.[step.position];
  const groupsError = stepError && 'groups' in stepError ? (stepError.groups as any) : undefined;

  return (
    <AccordionItem key={step.id || step.position} value={step.id || String(step.position)}>
      <AccordionTrigger tooltip={isOpen ? t('collapseStep') : t('expandStep')}>
        <StepAccordionTrigger
          step={step}
          isFirstMovableStep={isFirstMovableStep}
          isLastStep={isLastStep}
          subtitle={subtitle}
          groupsError={groupsError}
        />
      </AccordionTrigger>
      <AccordionContent>
        <StepAccordionContent step={step} />
      </AccordionContent>
    </AccordionItem>
  );
}

export default StepAccordion;