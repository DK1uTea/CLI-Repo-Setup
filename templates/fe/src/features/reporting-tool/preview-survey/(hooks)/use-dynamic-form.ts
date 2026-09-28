'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { type Resolver, useForm } from 'react-hook-form';
import { z } from 'zod';

import type { SurveyDetail } from '../../(helpers)/survey-detail-type';
import {
  buildSurveyDefaultValues,
  buildSurveySchema,
  buildSurveyStepFieldPaths,
  buildSurveyStepFields,
  type DynamicFormValues,
} from '../(helpers)/build-dynamic-schema';

const emptySurveySchema = z.object({}).passthrough() as z.ZodType<DynamicFormValues, DynamicFormValues>;

export const useDynamicForm = (surveyDetail?: SurveyDetail) => {
  const schema = (surveyDetail ? buildSurveySchema(surveyDetail) : emptySurveySchema) as z.ZodType<
    DynamicFormValues,
    DynamicFormValues
  >;
  const defaultValues = surveyDetail ? buildSurveyDefaultValues(surveyDetail) : {};
  const stepFields = surveyDetail ? buildSurveyStepFields(surveyDetail) : {};
  const stepFieldPaths = surveyDetail ? buildSurveyStepFieldPaths(surveyDetail) : {};

  const methods = useForm<DynamicFormValues>({
    resolver: zodResolver(schema) as Resolver<DynamicFormValues>,
    defaultValues,
    mode: 'onChange',
  });

  useEffect(() => {
    if (surveyDetail) {
      methods.reset(buildSurveyDefaultValues(surveyDetail));
    }
  }, [methods, surveyDetail]);

  return {
    methods,
    schema,
    stepFields,
    stepFieldPaths,
  };
};
