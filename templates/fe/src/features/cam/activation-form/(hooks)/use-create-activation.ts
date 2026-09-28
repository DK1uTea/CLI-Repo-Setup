'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createActivation } from '../(services)/activation-service'
import type { CreateActivationDto } from '../(services)/activation-service'

export function useCreateActivation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateActivationDto) => createActivation(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cam-activation-admin-list'] })
      queryClient.invalidateQueries({ queryKey: ['cam-activations-grouped'] })
    },
  })
}
