'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";
import { mapTradeFairEventFormToPayload } from "../(helpers)/trade-fair-event-form-mapper";
import type { TradeFairEventFormDto } from "../(helpers)/trade-fair-event-form-schema";

const createEvent = async (
  data: TradeFairEventFormDto,
  status: 'DRAFT' | 'PUBLISHED'
): Promise<{ id: string }> => {
  const payload = {
    ...mapTradeFairEventFormToPayload(data),
    status,
  };
  const response = await apiProxy.post('tf/events', payload);
  return response.data.data as { id: string };
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      status,
    }: {
      data: TradeFairEventFormDto;
      status: 'DRAFT' | 'PUBLISHED';
    }) => createEvent(data, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trade-fair-event-list"] });
    },
  });
};
