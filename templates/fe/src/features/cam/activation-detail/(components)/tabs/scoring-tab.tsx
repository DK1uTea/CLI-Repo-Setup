'use client';

import { useEffect } from 'react';
import { FormProvider } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { ActivationDetail } from '../../../(hooks)/use-activation-detail';
import { SCORING_CATEGORIES, SCORING_MAX_SCORE } from '../../(helpers)/scoring-constants';
import { buildScoringAnswerText } from '../../(helpers)/scoring-answer';
import { buildEvaluationScores, buildScoringFromEvaluation } from '../../(helpers)/scoring-evaluation';
import { useGetEvaluation } from '../../(hooks)/use-get-evaluation';
import { useSubmitEvaluation } from '../../(hooks)/use-submit-evaluation';
import { useScoringForm } from '../../(hooks)/use-scoring-form';
import { useScoringValidatorStore } from '../../(hooks)/use-scoring-validator-store';
import ScoringCategoryCard from '../activation-scoring/scoring-category-card';
import ScoringTotalCard from '../activation-scoring/scoring-total-card';
import ScoringPreQuestionCard from '../activation-scoring/scoring-pre-question-card';
import { ACTIVATION_READ_ONLY_STATUSES } from '../../../(helpers)/cam-constants';

type Props = {
  activationDetail: ActivationDetail;
};

const formatEnumLabel = (value?: string) => {
  if (!value) return '';
  return value.split('_').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
};

const ScoringTab = ({ activationDetail }: Props) => {
  const t = useTranslations('activationView');
  const isReadOnly = ACTIVATION_READ_ONLY_STATUSES.includes(activationDetail.status);
  const { data: evaluation } = useGetEvaluation(activationDetail.id, !!activationDetail.evaluation);
  const initialValues = evaluation ? buildScoringFromEvaluation(evaluation.points, (labelKey) => t(labelKey as never)) : null;
  const { form } = useScoringForm(initialValues, evaluation?.id);
  const registerValidate = useScoringValidatorStore((s) => s.registerValidate);
  const registerApprove = useScoringValidatorStore((s) => s.registerApprove);
  const unregister = useScoringValidatorStore((s) => s.unregister);
  const { mutateAsync: submitEvaluation } = useSubmitEvaluation();

  useEffect(() => {
    registerValidate(() => form.trigger());

    registerApprove(async () => {
      const values = form.getValues();
      const scores = buildEvaluationScores(values, (labelKey) => t(labelKey as never));
      await submitEvaluation({ activationId: activationDetail.id, maxScore: SCORING_MAX_SCORE, scores });
    });

    return unregister;
  }, [form, registerValidate, registerApprove, unregister, activationDetail.id, submitEvaluation, t]);

  const outletsAnswer = (() => {
    const n = activationDetail.numberOfOutlets;
    if (n == null) return null;
    const label = n === 1 ? t('drawer.briefing.outlet', { count: n }) : t('drawer.briefing.outlets', { count: n });
    return activationDetail.outletNotes ? `${label}, ${activationDetail.outletNotes}` : label;
  })();

  return (
    <FormProvider {...form}>
      <div className="flex w-full flex-col gap-4">
        <ScoringTotalCard />

        <ScoringPreQuestionCard
          title={t('scoring.responsibleCamTitle')}
          question={t('scoring.responsibleCamQuestion')}
          answer={activationDetail.responsibleCam ? formatEnumLabel(activationDetail.responsibleCam) : null}
        />
        <ScoringPreQuestionCard
          title={t('scoring.numberOfOutletsTitle')}
          question={t('scoring.numberOfOutletsQuestion')}
          answer={outletsAnswer}
        />

        {SCORING_CATEGORIES.map((category) => (
          <ScoringCategoryCard
            key={category.field}
            category={category}
            answer={buildScoringAnswerText(activationDetail, category.field)}
            disabled={isReadOnly}
          />
        ))}

        {isReadOnly && (
          <p className="text-center text-sm text-muted-foreground">{t('scoring.readOnlyNotice')}</p>
        )}
      </div>
    </FormProvider>
  );
};

export default ScoringTab;
