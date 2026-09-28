'use client';

import { FormProvider } from 'react-hook-form';
import { useEventForm } from '@/features/events/event-form/(hooks)/use-event-form';
import { EventFormFooter } from '@/features/events/event-form/(components)/event-form-footer';
import { EventCartDrawer } from '@/features/events/event-form/(components)/event-cart-drawer';

export default function EventCreationLayout({ children }: { children: React.ReactNode }) {
  const { methods } = useEventForm();

  return (
    <FormProvider {...methods}>
      <div className="-m-6 flex min-h-[calc(100dvh-64px)] flex-col">
        <div className="flex-1 p-6">{children}</div>
        <EventFormFooter />
      </div>
      <EventCartDrawer />
    </FormProvider>
  );
}
