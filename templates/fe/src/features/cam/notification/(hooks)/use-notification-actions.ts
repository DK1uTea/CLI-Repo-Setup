"use client";

import { useMutation } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";
import { useInvalidateNotifications } from "./use-notification-list";

export function useMarkNotificationRead() {
  const invalidate = useInvalidateNotifications();

  return useMutation({
    mutationFn: (id: string) => apiProxy.patch(`/notification/inapp/${id}/read`),
    onSuccess: invalidate,
  });
}

export function useMarkAllNotificationsRead() {
  const invalidate = useInvalidateNotifications();

  return useMutation({
    mutationFn: () => apiProxy.patch("/notification/inapp/read-all"),
    onSuccess: invalidate,
  });
}
