'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Controller, useFormContext, useFormState, useWatch } from "react-hook-form";
import { TradeFairSurveyFormDto } from "../../../(helpers)/trade-fair-survey-form-schema";
import { Input } from "@/shared/components/ui/input";
import { CheckIcon, Pencil } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const SurveyNameCard = () => {
  const t = useTranslations('reportingTool.tradeFairSurveyForm');
  const { control } = useFormContext<TradeFairSurveyFormDto>();
  const { errors } = useFormState<TradeFairSurveyFormDto>();
  const watch = useWatch<TradeFairSurveyFormDto>();
  const [isReadOnly, setIsReadOnly] = useState(false);
  const nameValue = watch.name;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('surveyName')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder={t('enterSurveyName')}
                  error={errors.name?.message}
                  className={cn("bg-background h-12 shrink-0", { "bg-gray-200": isReadOnly })}
                  readOnly={isReadOnly}
                />
              )}
            />
          </div>
          {nameValue && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsReadOnly(!isReadOnly)}
            >
              {isReadOnly ? <Pencil className="h-6 w-6 text-primary" /> : <CheckIcon className="h-6 w-6 text-primary" />}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default SurveyNameCard;