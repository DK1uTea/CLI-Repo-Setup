'use client';

import { useTranslations } from "next-intl";
import { TRADE_FAIR_EVENT_FORM_CONFIG, TradeFairEventFormMode } from "../(helpers)/trade-fair-event-form-config";
import { useTradeFairEventActions } from "../(hooks)/use-trade-fair-event-action";
import { parseAsString, useQueryState } from "nuqs";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/lib/utils";
import ForwardButton from "../../(components)/forward-button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { CheckIcon } from "lucide-react";
import { useFormContext, useFormState } from "react-hook-form";
import type { TradeFairEventFormDto } from "../(helpers)/trade-fair-event-form-schema";
import { requestGuardedNavigation } from "@/shared/hooks/common/use-navigation-guard";

type Props = {
  mode: TradeFairEventFormMode;
}

const TradeFairEventFormSidebar = ({ mode }: Props) => {
  const t = useTranslations('reportingTool.tradeFairEventForm');
  const config = TRADE_FAIR_EVENT_FORM_CONFIG
  const steps = config.steps;
  const { currentStep, goToStep } = useTradeFairEventActions({ steps });
  const currentIndex = steps.indexOf(currentStep);
  const [eventId] = useQueryState("id", parseAsString);
  const [returnEventId] = useQueryState("returnEventId", parseAsString);
  const [referrer] = useQueryState("referrer", parseAsString);
  const { control } = useFormContext<TradeFairEventFormDto>();
  const { isDirty } = useFormState({ control });

  const cancelHref = returnEventId
    ? `/reporting-tool?tab=dashboard&eventId=${returnEventId}`
    : referrer === "eventDetail" && eventId
    ? `/reporting-tool/event-detail?id=${eventId}`
    : (eventId ? `${config.cancelHref}?eventId=${eventId}` : config.cancelHref);

  const handleGoToStep = (step: (typeof steps)[number]) => {
    if (step === currentStep) return;
    if (isDirty) {
      requestGuardedNavigation(() => goToStep(step));
      return;
    }

    goToStep(step);
  };

  return (
    <>
      {/* Mobile compact bar */}
      <div className="lg:hidden sticky top-0 z-20 -mx-6 px-6 bg-background pb-3 border-b border-border">
        <div className="flex items-center gap-3 py-3">
          <ForwardButton href={cancelHref} />
          <p className="text-sm font-semibold">
            {mode === 'create' ? t('createEvent') : t('editEvent')}
          </p>
        </div>
        <div className="flex items-center justify-center gap-2">
          {steps.map((step, index) => {
            const isActive = step === currentStep;
            const isPast = index < currentIndex;
            return (
              <Button
                key={step}
                type="button"
                onClick={() => handleGoToStep(step)}
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  isActive || isPast ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                )}
              >
                {index + 1}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Desktop full sidebar */}
      <aside className="no-scroll hidden lg:flex sticky top-20 h-[calc(100dvh-64px)] w-1/4 shrink-0 flex-col overflow-y-auto _custom-scroll bg-background px-1 pb-28">
        <div className="flex items-center gap-3">
          <ForwardButton href={cancelHref} />
          <h1 className="text-[22px] font-semibold">
            {mode === 'create' ? t('createEvent') : t('updateEvent')}
          </h1>
        </div>

        <div className="mt-9">
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            {t('stepsLabel')}
          </p>
          <RadioGroup
            value={currentStep}
            onValueChange={(value) => {
              const nextStep = steps.find((step) => step === value);
              if (!nextStep) return;

              handleGoToStep(nextStep);
            }}
            className="flex flex-col gap-2.5"
          >
            {steps.map((step, index) => {
              const isActive = step === currentStep;
              const isPast = index < currentIndex;
              return (
                <Card
                  key={step}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleGoToStep(step)}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') return;

                    event.preventDefault();
                    handleGoToStep(step);
                  }}
                  className={cn(
                    isActive ? 'bg-gray-100' : 'hover:bg-light-gray cursor-pointer',
                    'py-3.5',
                  )}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col px-3 py-2">
                      <div className="flex items-center gap-3">
                        <div className="relative flex size-6 shrink-0 items-center justify-center">
                          {isPast && (
                            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <CheckIcon className="size-3" strokeWidth={3} />
                            </span>
                          )}
                          {!isPast && (
                            <RadioGroupItem
                              value={step}
                              aria-label={step}
                              className="border-2 border-muted"
                              onClick={(event) => event.stopPropagation()}
                            />
                          )}
                        </div>

                        <p className={cn('text-sm font-semibold')}>
                          {t(`steps.${step}`)}
                        </p>
                      </div>
                      {isActive && (
                        <p className="pl-9 text-[13px] text-muted-foreground">
                          {t(`stepDescriptions.${step}`)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </RadioGroup>
        </div>
      </aside>
    </>
  );
}

export default TradeFairEventFormSidebar;
