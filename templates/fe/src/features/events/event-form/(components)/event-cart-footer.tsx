import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/button';

type Props = {
  rentalTotal: number;
  purchaseTotal: number;
  currencySymbol: string;
  isPending: boolean;
  disabled: boolean;
  onNext: () => void;
  hasCartChanges?: boolean;
  onFinalizeEvent?: () => void;
};

export function EventCartFooter({
  rentalTotal, purchaseTotal, currencySymbol, isPending, disabled, onNext, hasCartChanges, onFinalizeEvent,
}: Props) {
  const t = useTranslations('common');
  const tForm = useTranslations('eventForm');
  const showFinalize = hasCartChanges && !!onFinalizeEvent;

  return (
    <div className="space-y-2.5 p-6 text-sm">
      <div className="flex justify-between">
        <p className="font-bold">{t('rentalTotal')}:</p>
        <p className="font-medium">{rentalTotal.toFixed(2)} {currencySymbol}</p>
      </div>
      <div className="flex justify-between">
        <p className="font-bold">{t('purchaseTotal')}:</p>
        <p className="font-medium">{purchaseTotal.toFixed(2)} {currencySymbol}</p>
      </div>
      <div className={cn('mt-2 flex gap-2', !showFinalize && 'flex-col')}>
        <Button
          type="button"
          data-testid="event-cart-next-button"
          className={cn(showFinalize ? 'flex-1' : 'w-full')}
          onClick={onNext}
          isLoading={isPending}
          disabled={disabled}
        >
          {tForm('actions.next')}
        </Button>
        {showFinalize && (
          <Button
            type="button"
            variant="outline-primary"
            className="flex-1"
            onClick={onFinalizeEvent}
            isLoading={isPending}
            disabled={disabled}
          >
            {tForm('actions.submit')}
          </Button>
        )}
      </div>
    </div>
  );
}
