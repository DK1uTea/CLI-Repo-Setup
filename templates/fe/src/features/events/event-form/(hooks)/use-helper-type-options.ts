import { useTranslations } from 'next-intl';

export type HelperTypeOption = {
  value: string;
  label: string;
};

export function useHelperTypeOptions(): HelperTypeOption[] {
  const t = useTranslations('eventForm');
  return [
    { value: 'DROPSHIPPER', label: t('helpingHands.helperTypes.DROPSHIPPER') },
    { value: 'PROWERB', label: t('helpingHands.helperTypes.PROWERB') },
  ];
}
