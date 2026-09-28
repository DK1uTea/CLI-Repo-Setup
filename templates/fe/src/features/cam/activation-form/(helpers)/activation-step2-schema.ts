import { z } from "zod";
import { zNumber, zString, zStringArray } from "@/shared/schemas";
import type { ImageFile } from "@/shared/components/ui/upload-dropzone";

export const activationStep2Schema = z.object({
  name: zString(["required"]),
  responsible: zString(["required"]),
  numberOfOutlets: zNumber(["required", "min:1"]),
  outletNotes: zString(["max:150"]).optional(),
  highTrafficZones: zStringArray(["required"]),
  highTrafficZoneNotes: zString(["max:150"]).optional(),
  targetGroups: zStringArray([]),
  targetGroupNotes: zString(["max:150"]).optional(),
  salesConcepts: zStringArray([]),
  salesConceptNotes: zString(["max:150"]).optional(),
  contractSituations: zStringArray([]),
  contractSituationNotes: zString(["max:150"]).optional(),
  revenuePotentials: zStringArray([]),
  profitability: zString([]),
  brandFit: zString([]),
  brandFitNotes: zString(["max:150"]).optional(),
  ahMarket: zStringArray([]),
  ahMarketMediaUrls: z.array(z.custom<ImageFile>()),
  aMarket: zStringArray([]),
  aMarketNotes: zString(["max:150"]).optional(),
  aMarketMediaUrls: z.array(z.custom<ImageFile>()),
});

export type ActivationStep2Data = z.infer<typeof activationStep2Schema>;
