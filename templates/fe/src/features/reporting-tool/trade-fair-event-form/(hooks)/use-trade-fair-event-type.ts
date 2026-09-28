'use client';

export type TradeFairEventTypeOption = {
  label: string;
  value: string;
};

export const useTradeFairEventType = () => {
  const eventTypes = [
    { label: 'Award', value: 'award' },
    { label: 'Congress', value: 'congress' },
    { label: 'Customer', value: 'customer' },
    { label: 'Dauerleihgabe', value: 'dauerleihgabe' },
    { label: 'Fair', value: 'fair' },
    { label: 'Get-together', value: 'gettogether' },
    { label: 'Musik', value: 'music' },
    { label: 'Sport', value: 'sport' },
  ] as const;

  return { eventTypes };
};
