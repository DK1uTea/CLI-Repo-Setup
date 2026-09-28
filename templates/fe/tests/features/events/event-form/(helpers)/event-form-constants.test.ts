import { describe, expect, it } from 'vitest';

import {
  isDauerleihgabeEventType,
  isPermanentLoanEventType,
} from '@/features/events/event-form/(helpers)/event-form-constants';

describe('isDauerleihgabeEventType', () => {
  it('matches by slug or name, case- and whitespace-insensitively', () => {
    expect(isDauerleihgabeEventType({ slug: 'dauerleihgabe' })).toBe(true);
    expect(isDauerleihgabeEventType({ slug: 'DAUERLEIHGABE' })).toBe(true);
    expect(isDauerleihgabeEventType({ slug: '  dauerleihgabe  ' })).toBe(true);
    expect(isDauerleihgabeEventType({ name: 'Dauerleihgabe' })).toBe(true);
  });

  it('does not match an unrelated event type', () => {
    expect(isDauerleihgabeEventType({ slug: 'conference', name: 'Conference' })).toBe(false);
  });

  it('returns false for null or undefined event type', () => {
    expect(isDauerleihgabeEventType(null)).toBe(false);
    expect(isDauerleihgabeEventType(undefined)).toBe(false);
    expect(isDauerleihgabeEventType({})).toBe(false);
  });
});

describe('isPermanentLoanEventType', () => {
  it('matches the canonical slug and name, case- and whitespace-insensitively', () => {
    expect(isPermanentLoanEventType({ slug: 'permanent-loan' })).toBe(true);
    expect(isPermanentLoanEventType({ name: 'Permanent Loan' })).toBe(true);
    expect(isPermanentLoanEventType({ name: '  PERMANENT LOAN  ' })).toBe(true);
  });

  it('matches the known backend typo variants', () => {
    expect(isPermanentLoanEventType({ slug: 'performance-load' })).toBe(true);
    expect(isPermanentLoanEventType({ name: 'performance load' })).toBe(true);
    expect(isPermanentLoanEventType({ name: 'permance load' })).toBe(true);
  });

  it('does not match an unrelated event type', () => {
    expect(isPermanentLoanEventType({ slug: 'conference', name: 'Conference' })).toBe(false);
  });

  it('returns false for null or undefined event type', () => {
    expect(isPermanentLoanEventType(null)).toBe(false);
    expect(isPermanentLoanEventType(undefined)).toBe(false);
    expect(isPermanentLoanEventType({})).toBe(false);
  });
});
