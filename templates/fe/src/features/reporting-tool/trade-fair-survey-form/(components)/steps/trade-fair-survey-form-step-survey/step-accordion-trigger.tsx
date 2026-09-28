import { Controller, useFormContext } from "react-hook-form";
import { StepDto, TradeFairSurveyFormDto } from "../../../(helpers)/trade-fair-survey-form-schema";
import { Pencil } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { useRef } from "react";
import { useStepAction } from "../../../(hooks)/use-step-action";
import { useTranslations } from "next-intl";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import StepActionButtons from "./step-action-buttons";
import { translateErrorMessage } from "@/lib/field-error";


type Props = {
  step: StepDto;
  isFirstMovableStep: boolean;
  isLastStep: boolean;
  subtitle: string;
  groupsError?: { message?: string };
};

const StepAccordionTrigger = ({ step, isFirstMovableStep, isLastStep, subtitle, groupsError }: Props) => {
  const { control } = useFormContext<TradeFairSurveyFormDto>();
  const t = useTranslations('reportingTool.tradeFairSurveyForm');
  const { moveStep, duplicateStep, deleteStep } = useStepAction();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handlePencilClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const input = inputRef.current;
    if (input) {
      input.focus();
      const length = input.value.length;
      input.setSelectionRange(length, length);
    }
  };

  return (
    <div className="flex items-center justify-between w-full mr-3">
      <div className="flex items-center gap-3">
        <span className="flex justify-center items-center text-primary-foreground bg-primary w-9 h-9 rounded-full font-semibold text-lg shrink-0">
          {step.position + 1}
        </span>
        <div className="flex flex-col gap-0.5 text-left flex-1 min-w-0">
          <div className="flex items-center gap-2 w-full">
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  role="button"
                  tabIndex={0}
                  className="h-8 w-8 shrink-0 flex items-center justify-center hover:bg-slate-100 rounded-full cursor-pointer transition-colors text-primary"
                  onClick={handlePencilClick}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handlePencilClick(e as any);
                    }
                  }}
                >
                  <Pencil className="h-4 w-4 text-primary" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {t('clickToEditStepName')}
              </TooltipContent>
            </Tooltip>
            <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
              <Controller
                control={control}
                name={`steps.${step.position}.title`}
                render={({ field }) => (
                  <Input
                    {...field}
                    ref={(el) => {
                      field.ref(el);
                      inputRef.current = el;
                    }}
                    value={field.value ?? ""}
                    className="bg-transparent border-none shadow-none focus-visible:ring-0 p-0 h-auto text-base! font-medium w-full"
                    placeholder={t('enterStepTitle')}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.stopPropagation();
                      }
                    }}
                  />
                )}
              />
            </div>
          </div>
          <span className="text-muted-foreground/50 text-xs">{subtitle}</span>
          {groupsError?.message && (
            <span className="text-red-500 text-xs font-medium mt-0.5">{translateErrorMessage(groupsError.message)}</span>
          )}
        </div>
      </div>
      {step.position > 0 && (
        <StepActionButtons
          step={step}
          isFirstMovableStep={isFirstMovableStep}
          isLastStep={isLastStep}
          moveStep={moveStep}
          duplicateStep={duplicateStep}
          deleteStep={deleteStep}
        />
      )}
    </div>
  );
};

export default StepAccordionTrigger;
