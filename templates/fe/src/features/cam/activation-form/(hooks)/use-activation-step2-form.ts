'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { activationStep2Schema, type ActivationStep2Data } from '../(helpers)/activation-step2-schema'

const DEFAULT_VALUES: ActivationStep2Data = {
  name: '',
  responsible: '',
  profitability: '',
  brandFit: '',
  brandFitNotes: '',
  numberOfOutlets: undefined as unknown as number,
  outletNotes: '',
  highTrafficZones: [],
  highTrafficZoneNotes: '',
  targetGroups: [],
  targetGroupNotes: '',
  salesConcepts: [],
  salesConceptNotes: '',
  contractSituations: [],
  contractSituationNotes: '',
  revenuePotentials: [],
  ahMarket: [],
  ahMarketMediaUrls: [],
  aMarket: [],
  aMarketNotes: '',
  aMarketMediaUrls: [],
}

export function useActivationStep2Form(initialData?: Partial<ActivationStep2Data>) {
  const form = useForm<ActivationStep2Data>({
    resolver: zodResolver(activationStep2Schema),
    defaultValues: { ...DEFAULT_VALUES, ...initialData },
  })

  return { form }
}
