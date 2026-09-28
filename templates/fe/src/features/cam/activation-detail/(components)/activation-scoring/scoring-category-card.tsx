'use client';

import { Control, Controller, useFormContext, useFormState } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { ChevronRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScoringCategory } from '../../(helpers)/scoring-constants';
import { ScoringFormValues } from '../../(helpers)/scoring-schema';
import ScoringOptionCard from './scoring-option-card';

type Props = {
  category: ScoringCategory;
  answer: string | null;
  disabled?: boolean;
};

const ScoringCategoryCard = ({ category, answer, disabled }: Props) => {
  const t = useTranslations('activationView');
  const { control } = useFormContext<ScoringFormValues>();
  const { errors } = useFormState({ control, name: category.field });
  const error = errors[category.field];
  const maxPts = Math.max(...category.options.map((o) => o.pts));

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{t(category.titleKey as never)}</h3>
        <p className="text-sm text-muted-foreground">{t(category.questionKey as never)}</p>
      </div>

      {answer && (
        <div>
          <span className="mb-2 block text-sm font-medium uppercase text-muted-foreground">{t('scoring.sectionAnswer')}</span>
          <div className="rounded-xl border border-border bg-background p-3.5 text-sm font-medium text-foreground">
            <div className="flex items-start gap-2">
              <ChevronRightIcon className="mt-0.5 size-4 shrink-0" />
              <span className="flex-1">{answer}</span>
            </div>
          </div>
        </div>
      )}

      <div>
        <span className="mb-2 block text-sm font-medium uppercase text-muted-foreground">{t('scoring.sectionScoringOptions')}</span>
        <Controller
          control={control}
          name={category.field}
          render={({ field }) => (
            <div className="space-y-2">
              {category.options.map((option) => (
                <ScoringOptionCard
                  key={option.key}
                  option={option}
                  isSelected={field.value === option.key}
                  onClick={disabled ? undefined : () => field.onChange(option.key)}
                  disabled={disabled}
                />
              ))}
            </div>
          )}
        />
        {error && <p className="mt-2 text-xs text-destructive">{error.message as string}</p>}
      </div>

      <ScoringScoreBar control={control} field={category.field} options={category.options} maxPts={maxPts} />
    </div>
  );
};

function ScoringScoreBar({
  control, field, options, maxPts,
}: {
  control: Control<ScoringFormValues>;
  field: ScoringCategory['field'];
  options: ScoringCategory['options'];
  maxPts: number;
}) {
  const t = useTranslations('activationView');

  return (
    <Controller
      control={control}
      name={field}
      render={({ field: f }) => {
        const selectedOption = options.find((o) => o.key === f.value);
        const pts = selectedOption?.pts ?? 0;
        const percent = maxPts > 0 ? Math.round((pts / maxPts) * 100) : 0;
        const barColor = !selectedOption
          ? 'bg-muted-foreground/30'
          : pts >= maxPts
            ? 'bg-emerald-600'
            : pts <= 1
              ? 'bg-muted-foreground/50'
              : 'bg-amber-400';

        return (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-normal uppercase text-muted-foreground">{t('scoring.sectionScore')}</span>
              <span className="text-base font-bold text-foreground">
                {pts}
                <span className="font-bold text-muted-foreground"> / {maxPts}</span>
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${percent}%` }} />
            </div>
          </div>
        );
      }}
    />
  );
}

export default ScoringCategoryCard;
