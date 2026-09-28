'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { ScoringOption, SpecifyTag } from '../../(helpers)/scoring-constants';

type Props = {
  option: ScoringOption;
  isSelected: boolean;
  onClick?: () => void;
  disabled?: boolean;
};

const ScoringOptionCard = ({ option, isSelected, onClick, disabled }: Props) => {
  const t = useTranslations('activationView');
  const hasSpecify = isSelected && option.specifyTags && option.specifyTags.length > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full rounded-2xl border px-3.5 py-3 text-left',
        isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card',
        disabled ? 'cursor-not-allowed' : 'hover:border-muted-foreground/40',
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'flex size-4 shrink-0 items-center justify-center rounded-full border-2',
              isSelected ? 'border-primary' : 'border-muted-foreground/40',
            )}
          >
            {isSelected && <span className="block size-2 rounded-full bg-primary" />}
          </span>
          <span className={cn('text-base font-medium', isSelected ? 'text-foreground' : 'text-muted-foreground')}>
            {t(option.labelKey as never)}
          </span>
        </div>
        <span
          className={cn(
            'whitespace-nowrap rounded-lg px-2 py-1 text-xs font-normal',
            isSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
          )}
        >
          {t('scoring.points', { points: option.pts })}
        </span>
      </div>

      {hasSpecify && (
        <div className="mt-3 border-t border-primary/20 pt-3">
          <span className="mb-2 block text-xs font-medium uppercase text-muted-foreground">{t('scoring.specifyEvaluation')}</span>
          <div className="flex flex-wrap gap-1.5">
            {(option.specifyTags as SpecifyTag[]).map((tag, i) => {
              const label = typeof tag === 'string' ? tag : tag.label;
              const highlighted = typeof tag !== 'string' && tag.highlighted;
              return (
                <span
                  key={i}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-xs',
                    highlighted
                      ? 'border-primary/30 bg-primary/10 font-medium text-primary'
                      : 'border-border bg-background text-muted-foreground',
                  )}
                >
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </button>
  );
};

export default ScoringOptionCard;
