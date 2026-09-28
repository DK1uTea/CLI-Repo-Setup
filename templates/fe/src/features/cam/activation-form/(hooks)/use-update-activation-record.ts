"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";
import { CONTACTS_QUERY_KEY } from "@/features/cam/activation-detail/(hooks)/use-list-contacts";
import type { CreateActivationDto } from "../(services)/activation-service";

export type UpdateActivationDto = Partial<CreateActivationDto>;

async function updateActivationRecord(
  id: string,
  dto: UpdateActivationDto,
): Promise<void> {
  await apiProxy.put(`/cam/activations/${id}`, dto);
}

export function useUpdateActivationRecord(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateActivationDto }) =>
      updateActivationRecord(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["cam-activation-detail", id] });
      queryClient.invalidateQueries({ queryKey: [CONTACTS_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: ["cam-activation-admin-list"] });
      queryClient.invalidateQueries({ queryKey: ["cam-activations-grouped"] });
      onSuccess?.();
    },
  });
}
