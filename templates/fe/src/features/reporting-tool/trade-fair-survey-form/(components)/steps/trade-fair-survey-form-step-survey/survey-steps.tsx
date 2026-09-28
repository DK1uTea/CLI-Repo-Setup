'use client';

import { useState, useEffect, useRef } from "react";
import { Button } from "@/shared/components/ui/button";
import { PlusIcon } from "lucide-react";
import { StepDto, TradeFairSurveyFormDto } from "../../../(helpers)/trade-fair-survey-form-schema";
import { useWatch } from "react-hook-form";
import { Accordion } from "@/shared/components/ui/accordion";
import StepAccordion from "./step-accordion";
import { useStepAction } from "../../../(hooks)/use-step-action";
import { useTranslations } from "next-intl";

const SurveySteps = () => {
  const watch = useWatch<TradeFairSurveyFormDto>();
  const stepsNum = watch.steps?.length;
  const steps = watch.steps as StepDto[] | undefined;
  const { addStep } = useStepAction();
  const t = useTranslations('reportingTool.tradeFairSurveyForm');

  const [openItems, setOpenItems] = useState<string[]>(() => {
    return steps ? [...steps].sort((a, b) => a.position - b.position).map((step) => step.id || String(step.position)) : [];
  });

  const prevStepsLength = useRef(steps?.length || 0);
  const prevFirstStepId = useRef<string | undefined>(steps?.[0]?.id);

  useEffect(() => {
    const currentLength = steps?.length || 0;
    const currentFirstStepId = steps?.[0]?.id;

    if (steps) {
      if (currentFirstStepId !== prevFirstStepId.current) {
        // The steps list has been reset/loaded (e.g., from DB). Expand all steps.
        const sorted = [...steps].sort((a, b) => a.position - b.position);
        setOpenItems(sorted.map((step) => step.id || String(step.position)));
      } else if (currentLength > prevStepsLength.current) {
        // Auto-expand any newly added step positions
        const newPositions: string[] = [];
        const sorted = [...steps].sort((a, b) => a.position - b.position);
        for (let i = prevStepsLength.current; i < currentLength; i++) {
          const step = sorted[i];
          if (step) {
            newPositions.push(step.id || String(step.position));
          }
        }
        setOpenItems((prev) => [...prev, ...newPositions]);
      }
    }
    prevStepsLength.current = currentLength;
    prevFirstStepId.current = currentFirstStepId;
  }, [steps]);


  const handleExpandAll = () => {
    if (steps) {
      setOpenItems([...steps].sort((a, b) => a.position - b.position).map((step) => step.id || String(step.position)));
    }
  };

  const handleCollapseAll = () => {
    setOpenItems([]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-[13px] ">{stepsNum} {t('stepsCount')}</span>
        <div className="flex">
          <Button
            type="button"
            variant="ghost"
            className="text-[13px] text-muted-foreground hover:underline cursor-pointer"
            onClick={handleExpandAll}
          >
            {t('expandAll')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="text-[13px] text-muted-foreground hover:underline cursor-pointer"
            onClick={handleCollapseAll}
          >
            {t('collapseAll')}
          </Button>
        </div>
      </div>
      {!steps && (
        <div>
          {t('noStepsYet')}
        </div>
      )}
      {steps && (
        <Accordion type="multiple" value={openItems} onValueChange={setOpenItems}>
          {[...steps].sort((a, b) => a.position - b.position).map((step) => (
            <StepAccordion
              key={step.id || step.position}
              step={step}
              isOpen={openItems.includes(step.id || String(step.position))}
            />
          ))}
        </Accordion>
      )}
      <Button className="text-sm lg:h-12" onClick={addStep}>
        <PlusIcon data-icon="inline-start" />{t('addStepBtn')}
      </Button>
    </div>
  );
}

export default SurveySteps;