'use client';

import { useQuery } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';

export type Store = {
  id: string;
  name: string;
  address: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
};

export type Evaluation = {
  maxScore: number;
  score: number;
};

export type Participant = {
  userId: string;
  name: string;
  email: string;
  avatar: string | null;
};

export type MediaUrl = {
  path: string;
  createdAt: string;
};

export type Contact = {
  id?: string;
  name: string;
  email: string;
  tel: string;
};

export type ActivationDetail = {
  id: string;
  code: string;
  name: string;
  status: string; // e.g., 'IN_PROGRESS'
  responsibleCam: string;
  numberOfOutlets: number;
  outletNotes: string;
  highTrafficZones: string[];
  highTrafficZoneNotes: string;
  targetGroups: string[];
  targetGroupNotes: string;
  salesConcepts: string[];
  salesConceptNotes: string;
  contractSituations: string[];
  contractSituationNotes: string;
  revenuePotentials: string[];
  ahMarket: string[];
  ahMarketMediaUrls: MediaUrl[];
  aMarket: string[];
  aMarketNotes: string;
  aMarketMediaUrls: MediaUrl[];
  brandFit: string;
  brandFitNotes: string;
  profitability: string;
  store: Store;
  evaluation: Evaluation | null;
  participants: Participant[];
  contacts: Contact[];
  isSubscribed: boolean;
  createdAt: string;
  updatedAt: string;
};

async function fetchActivationDetail(activationId: string): Promise<ActivationDetail> {
  const response = await apiProxy.get<{ data: ActivationDetail }>(`/cam/activations/${activationId}`);
  return response.data.data;
}

export function useActivationDetail(activationId?: string | null) {
  return useQuery({
    queryKey: ['cam-activation-detail', activationId],
    queryFn: () => fetchActivationDetail(activationId!),
    enabled: !!activationId,
  });
}
