import type {
  EventListItemEntity,
  ListEventsByDeviceQuery,
  ListEventsQuery,
  ListEventsResult,
} from './events.types';

export const EVENTS_REPOSITORY = Symbol('EVENTS_REPOSITORY');

export interface IEventsRepository {
  list(query: ListEventsQuery): Promise<ListEventsResult>;

  listByDevice(query: ListEventsByDeviceQuery): Promise<ListEventsResult>;
}

export type { EventListItemEntity, ListEventsByDeviceQuery, ListEventsQuery, ListEventsResult };
