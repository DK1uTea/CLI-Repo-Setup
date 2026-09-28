"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";
import { mapTradeFairEventFormToPayload } from "../(helpers)/trade-fair-event-form-mapper";
import type { TradeFairEventFormDto } from "../(helpers)/trade-fair-event-form-schema";

const updateEvent = async (
  eventId: string,
  data: TradeFairEventFormDto,
  status?: "DRAFT" | "PUBLISHED",
) => {
  const payload = {
    ...mapTradeFairEventFormToPayload(data),
    ...(status ? { status } : {}),
  };
  const response = await apiProxy.put(`tf/events/${eventId}`, payload);
  return response.data;
};

export const useUpdateEvent = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      status,
    }: {
      data: TradeFairEventFormDto;
      status?: "DRAFT" | "PUBLISHED";
    }) => updateEvent(eventId, data, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["trade-fair-event-detail", eventId],
      });
      queryClient.invalidateQueries({ queryKey: ["trade-fair-event-list"] });
    },
  });
};
