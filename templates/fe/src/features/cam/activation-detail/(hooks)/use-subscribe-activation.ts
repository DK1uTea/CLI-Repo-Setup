"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";

async function subscribeActivation(id: string) {
  const { data } = await apiProxy.post(`/cam/activations/${id}/subscribe`);
  return data;
}

async function unsubscribeActivation(id: string) {
  const { data } = await apiProxy.delete(`/cam/activations/${id}/unsubscribe`);
  return data;
}

export function useSubscribeActivation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subscribeActivation,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: ["cam-activation-detail", id],
      });
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "cam-activation-participants" &&
          query.queryKey[1] === id,
      });
    },
  });
}

export function useUnsubscribeActivation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unsubscribeActivation,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: ["cam-activation-detail", id],
      });
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "cam-activation-participants" &&
          query.queryKey[1] === id,
      });
    },
  });
}
