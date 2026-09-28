'use client';

import { useEffect, useRef } from 'react';
import { FormProvider } from 'react-hook-form';
import { parseAsString, useQueryState } from 'nuqs';

import TradeFairEventFormFooter from "@/features/reporting-tool/trade-fair-event-form/(components)/trade-fair-event-form-footer";
import { useTradeFairEventForm } from "@/features/reporting-tool/trade-fair-event-form/(hooks)/use-trade-fair-event-form";
import { useEventDetail } from "@/features/reporting-tool/(hooks)/use-event-detail";
import { mapTradeFairEventToFormValues } from "@/features/reporting-tool/trade-fair-event-form/(helpers)/trade-fair-event-form-mapper";

export default function TradeFairEventCreationLayout({ children }: { children: React.ReactNode }) {
  const { methods } = useTradeFairEventForm();
  const [eventId] = useQueryState('id', parseAsString);
  const { eventDetail } = useEventDetail(eventId || '');
  const initializedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!eventDetail) return;
    if (initializedRef.current === eventId) return;

    methods.reset({
      ...methods.getValues(),
      ...mapTradeFairEventToFormValues(eventDetail),
    });
    initializedRef.current = eventId;
  }, [eventDetail, eventId, methods]);

  return (
    <FormProvider {...methods}>
      <div className="-m-6 flex min-h-[calc(100dvh-64px)] flex-col">
        <div className="flex-1 p-6">{children}</div>
        <TradeFairEventFormFooter />
      </div>
    </FormProvider>
  );
}
