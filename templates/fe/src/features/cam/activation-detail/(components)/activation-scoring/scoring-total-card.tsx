'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Badge } from '@/shared/components/ui/badge';
import { SCORE_GROUPS, SCORING_CATEGORIES, SCORING_MAX_SCORE } from '../../(helpers)/scoring-constants';
import { ScoringFormValues } from '../../(helpers)/scoring-schema';

function getPts(values: Partial<ScoringFormValues>, field: keyof ScoringFormValues) {
  const category = SCORING_CATEGORIES.find((c) => c.field === field);
  const option = category?.options.find((o) => o.key === values[field]);
  return option?.pts ?? 0;
}

function getRating(score: number): { labelKey: string; className: string } | null {
  if (score >= 19) return { labelKey: 'scoring.ratingHigh', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
  if (score >= 13) return { labelKey: 'scoring.ratingMedium', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
  if (score >= 6) return { labelKey: 'scoring.ratingLow', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' };
  return null;
}

const ScoringTotalCard = () => {
  const t = useTranslations('activationView');
  const { control } = useFormContext<ScoringFormValues>();
  const values = useWatch({ control });

  const groups = SCORE_GROUPS.map((group) => ({
    ...group,
    value: group.fields.reduce((sum, field) => sum + getPts(values, field), 0),
  }));

  const totalScore = groups.reduce((sum, g) => sum + g.value, 0);
  const progressPercent = SCORING_MAX_SCORE > 0 ? Math.round((totalScore / SCORING_MAX_SCORE) * 100) : 0;
  const rating = getRating(totalScore);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-normal uppercase text-muted-foreground">{t('scoring.totalScoreTitle')}</h2>

      <div className="mb-2 flex items-center justify-between">
        <span className="text-3xl font-bold text-foreground">
          {totalScore}
          <span className="text-xl font-normal text-muted-foreground"> / {SCORING_MAX_SCORE}</span>
        </span>
        {rating && <Badge className={cn('border-transparent', rating.className)}>{t(rating.labelKey as never)}</Badge>}
      </div>

      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        {groups.map((group) => {
          const pct = group.max > 0 ? Math.round((group.value / group.max) * 100) : 0;
          const barColor =
            group.value === 0
              ? 'bg-muted-foreground/30'
              : group.value >= group.max
                ? 'bg-emerald-600'
                : group.value <= 1
                  ? 'bg-muted-foreground/50'
                  : 'bg-amber-400';

          return (
            <div key={group.labelKey}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-normal text-muted-foreground">{t(group.labelKey as never)}</span>
                <span className="text-sm font-bold text-foreground">
                  {group.value}
                  <span className="font-normal text-muted-foreground"> / {group.max}</span>
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScoringTotalCard;
