"use client";

import { useMutation } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";

export function useRemoveAvatar() {
  return useMutation({
    mutationFn: () => apiProxy.delete("/user/remove-avatar"),
  });
}
