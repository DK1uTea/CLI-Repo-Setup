'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { buildScoringSchema, SCORING_DEFAULT_VALUES, ScoringFormValues } from '../(helpers)/scoring-schema';

export function useScoringForm(initialValues?: ScoringFormValues | null, resetKey?: string) {
  const t = useTranslations('activationView');

  const form = useForm<ScoringFormValues>({
    resolver: zodResolver(buildScoringSchema(t('scoring.optionRequired'))),
    defaultValues: initialValues ?? SCORING_DEFAULT_VALUES,
  });

  useEffect(() => {
    if (initialValues) form.reset(initialValues);
  }, [resetKey]);

  return { form };
}
