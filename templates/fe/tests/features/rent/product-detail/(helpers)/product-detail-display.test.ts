import { describe, expect, it } from 'vitest';

import { hasDisplayValue } from '@/features/rent/product-detail/(helpers)/product-detail-display';

describe('hasDisplayValue', () => {
  it('rejects null and undefined', () => {
    expect(hasDisplayValue(null)).toBe(false);
    expect(hasDisplayValue(undefined)).toBe(false);
  });

  it('rejects empty and placeholder dash strings', () => {
    expect(hasDisplayValue('')).toBe(false);
    expect(hasDisplayValue('-')).toBe(false);
    expect(hasDisplayValue('  ')).toBe(false);
  });

  it('accepts a real string value', () => {
    expect(hasDisplayValue('Aluminium')).toBe(true);
  });

  it('accepts non-string values such as numbers', () => {
    expect(hasDisplayValue(0)).toBe(true);
    expect(hasDisplayValue(5)).toBe(true);
  });
});
