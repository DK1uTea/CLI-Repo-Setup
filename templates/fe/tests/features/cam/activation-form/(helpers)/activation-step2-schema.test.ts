import { describe, expect, it } from 'vitest';

import { activationStep2Schema } from '@/features/cam/activation-form/(helpers)/activation-step2-schema';

const complete = {
  name: 'Activation',
  responsible: 'cam-user',
  numberOfOutlets: 1,
  highTrafficZones: ['TRAIN_STATION'],
  targetGroups: ['ADULTS'],
  salesConcepts: ['TAKE_AWAY'],
  contractSituations: ['ACTIVE_CC'],
  revenuePotentials: ['SOCVI'],
  ahMarket: ['OUTDOOR_AREA'],
  ahMarketMediaUrls: [],
  aMarket: ['COUNTER_AREA'],
  aMarketMediaUrls: [],
  brandFit: 'STANDARD',
  profitability: 'WITHIN_FRAMEWORK',
};

describe('CAM activation step 2 schema', () => {
  it('accepts all required briefing selections with optional notes/media', () => {
    expect(activationStep2Schema.safeParse(complete).success).toBe(true);
  });

  it('rejects missing name, responsible CAM, outlet count and selection groups', () => {
    const result = activationStep2Schema.safeParse({ ...complete, name: '', responsible: '', numberOfOutlets: 0, highTrafficZones: [] });
    expect(result.success).toBe(false);
  });

  it('limits every optional note to 150 characters', () => {
    const result = activationStep2Schema.safeParse({ ...complete, outletNotes: 'x'.repeat(151) });
    expect(result.success).toBe(false);
  });
});
