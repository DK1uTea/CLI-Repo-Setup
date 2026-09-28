import { describe, expect, it } from 'vitest';

import { buildStoreSchema } from '@/features/cam/activation-form/(helpers)/activation-schema';

describe('CAM store schema', () => {
  it('accepts a complete store and contact', () => {
    const result = buildStoreSchema().safeParse({
      storeName: 'E2E Store',
      storeAddress: 'Hauptstraße 1',
      contactName: 'Max Mustermann',
      contactPhone: '+49 3012345678',
      contactEmail: 'max@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing required store values and invalid contact formats', () => {
    const result = buildStoreSchema().safeParse({
      storeName: '',
      storeAddress: '',
      contactName: '',
      contactPhone: 'bad',
      contactEmail: 'bad',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(Object.keys(result.error.flatten().fieldErrors)).toEqual(
        expect.arrayContaining(['storeName', 'storeAddress', 'contactName', 'contactPhone', 'contactEmail']),
      );
    }
  });
});
