import { apiProxy } from "@/lib/api";

export type CreateActivationDto = {
  storeId: string;
  name: string;
  responsibleCam: string;
  numberOfOutlets: number;
  outletNotes?: string;
  highTrafficZones: string[];
  highTrafficZoneNotes?: string;
  targetGroups: string[];
  targetGroupNotes?: string;
  salesConcepts: string[];
  salesConceptNotes?: string;
  contractSituations: string[];
  contractSituationNotes?: string;
  revenuePotentials: string[];
  ahMarket: string[];
  ahMarketMediaUrls: string[];
  aMarket: string[];
  aMarketNotes?: string;
  aMarketMediaUrls: string[];
  brandFit: string;
  brandFitNotes?: string;
  profitability: string;
};

export type CreatedActivation = {
  id: string;
};

export async function createActivation(dto: CreateActivationDto) {
  const response = await apiProxy.post("/cam/activations", dto);
  return response.data.data as CreatedActivation;
}
