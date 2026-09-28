import { describe, expect, it } from 'vitest';

import {
  addUserDefaultValues,
  addUserSchema,
} from '@/features/reporting-tool/(helpers)/add-user-schema';

describe('addUserSchema', () => {
  it.each(['PROMOTER', 'SALES_REP', 'ADMIN'] as const)('accepts the supported %s role', (role) => {
    expect(addUserSchema.safeParse({
      firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', role,
    }).success).toBe(true);
  });

  it('rejects missing names and an invalid email', () => {
    const result = addUserSchema.safeParse({
      firstName: '', lastName: '', email: 'invalid', role: 'PROMOTER',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(Object.keys(result.error.flatten().fieldErrors))
        .toEqual(expect.arrayContaining(['firstName', 'lastName', 'email']));
    }
  });

  it('rejects roles outside the Trade Fair assignment contract', () => {
    expect(addUserSchema.safeParse({
      firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', role: 'VIEWER',
    }).success).toBe(false);
  });

  it('defaults new users to the PROMOTER role', () => {
    expect(addUserDefaultValues).toEqual({ firstName: '', lastName: '', email: '', role: 'PROMOTER' });
  });
});
