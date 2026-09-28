import { STEP_NAMES, type StepName } from './event-form-schema';

export type EventFormVariant = 'events' | 'calendar';
export type EventFormMode = 'create' | 'update';

type EventFormConfig = {
  steps: readonly StepName[];
  cancelHref: string;
  submitRedirectHref: string;
};

export const EVENT_FORM_CONFIG: Record<EventFormVariant, EventFormConfig> = {
  events: {
    steps: STEP_NAMES,
    cancelHref: '/events',
    submitRedirectHref: '/events',
  },
  calendar: {
    steps: ['overview'],
    cancelHref: '/calendar-dashboard',
    submitRedirectHref: '/calendar-dashboard',
  },
};
