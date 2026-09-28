import { z } from 'zod';

export function buildScoringSchema(requiredMessage: string) {
  return z.object({
    htz: z.string().min(1, requiredMessage),
    targetGroup: z.string().min(1, requiredMessage),
    salesConcept: z.string().min(1, requiredMessage),
    contractSituation: z.string().min(1, requiredMessage),
    revenuePotential: z.string().min(1, requiredMessage),
    hMarkt: z.string().min(1, requiredMessage),
    ahMarkt: z.string().min(1, requiredMessage),
    brandFit: z.string().min(1, requiredMessage),
    impulsePoints: z.string().min(1, requiredMessage),
  });
}

export type ScoringFormValues = z.infer<ReturnType<typeof buildScoringSchema>>;

export const SCORING_DEFAULT_VALUES: ScoringFormValues = {
  htz: '',
  targetGroup: '',
  salesConcept: '',
  contractSituation: '',
  revenuePotential: '',
  hMarkt: '',
  ahMarkt: '',
  brandFit: '',
  impulsePoints: '',
};
