import { PERMISSIONS } from '@/shared/constants/permissions';
import type { EventCommonNamespace } from '../(services)/event-common-service';

export const EVENT_COMMON_COMMENT_PERMISSION: Record<EventCommonNamespace, string> = {
  eventDetail: PERMISSIONS.Event.Comment,
  calendarEventDetail: PERMISSIONS.Calendar.Comment,
};

export const EVENT_COMMON_MANAGE_FILES_PERMISSION: Record<EventCommonNamespace, string> = {
  eventDetail: PERMISSIONS.Event.ManageFiles,
  calendarEventDetail: PERMISSIONS.Calendar.ManageFiles,
};
