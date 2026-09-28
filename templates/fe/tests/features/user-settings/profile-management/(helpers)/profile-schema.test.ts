import { describe, expect, it } from 'vitest'

import { profileSchema } from '@/features/user-settings/profile-management/(helpers)/profile-schema'

/**
 * Sheet source: Profile Management sheet, section "2. Personal Information" — the
 * boundary/format cases that don't need a full component render.
 */

function base(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    firstName: 'Tu',
    lastName: 'Nguyen',
    email: 'tu@example.com',
    phone: '',
    ...overrides,
  }
}

describe('profileSchema — firstName/lastName', () => {
  it('rejects a first name of 1 character (below the 2-char minimum)', () => {
    const result = profileSchema.safeParse(base({ firstName: 'T' }))
    expect(result.success).toBe(false)
  })

  it('accepts a first name of exactly 2 characters (minimum boundary)', () => {
    const result = profileSchema.safeParse(base({ firstName: 'Tu' }))
    expect(result.success).toBe(true)
  })

  it('accepts a last name of exactly 100 characters (maximum boundary)', () => {
    const result = profileSchema.safeParse(base({ lastName: 'A'.repeat(100) }))
    expect(result.success).toBe(true)
  })

  it('rejects a last name of 101 characters (over the maximum)', () => {
    const result = profileSchema.safeParse(base({ lastName: 'A'.repeat(101) }))
    expect(result.success).toBe(false)
  })

  it('rejects an empty first name as required', () => {
    const result = profileSchema.safeParse(base({ firstName: '' }))
    expect(result.success).toBe(false)
  })

  it('accepts a Vietnamese name with diacritics with no encoding issues', () => {
    const result = profileSchema.safeParse(base({ firstName: 'Tú', lastName: 'Anh Hà' }))
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.lastName).toBe('Anh Hà')
    }
  })

  it('accepts special characters and digits in a name (schema has no charset restriction beyond length)', () => {
    const result = profileSchema.safeParse(base({ firstName: 'Tu@123' }))
    expect(result.success).toBe(true)
  })

  // Sheet requirement ("Khoảng trắng đầu/cuối tên" — leading/trailing whitespace should be
  // trimmed before saving). Verified against real code: `zString` (`string.schema.ts`) only
  // uses `.trim()` to test *whether* the required check should fire — the value itself is
  // never transformed/trimmed, and `escapeHTML` in `use-submit-profile-setting.ts` does not
  // trim either. " Tu " (4 chars, only 2 of them non-space) currently passes validation and
  // would be saved with its surrounding spaces intact. Flagging back to dev — no trim
  // transform exists in profileSchema/zString to test against.
  it.todo(
    'trims leading/trailing whitespace from firstName/lastName before it is considered for min-length/saved — zString has no trim transform, only a trimmed length check for the "required" rule',
  )
})

describe('profileSchema — phone', () => {
  it('accepts an empty phone (optional per CONTEXT.md)', () => {
    const result = profileSchema.safeParse(base({ phone: '' }))
    expect(result.success).toBe(true)
  })

  it('accepts a valid phone with a country code', () => {
    const result = profileSchema.safeParse(base({ phone: '+491701234567' }))
    expect(result.success).toBe(true)
  })

  it('rejects a phone containing letters/symbols', () => {
    const result = profileSchema.safeParse(base({ phone: 'abc!@#' }))
    expect(result.success).toBe(false)
  })

  it('rejects a phone shorter than 5 digits', () => {
    const result = profileSchema.safeParse(base({ phone: '1234' }))
    expect(result.success).toBe(false)
  })

  it('rejects a phone longer than 20 digits', () => {
    const result = profileSchema.safeParse(base({ phone: '1'.repeat(21) }))
    expect(result.success).toBe(false)
  })

  it('accepts a phone at the 5-digit minimum boundary', () => {
    const result = profileSchema.safeParse(base({ phone: '12345' }))
    expect(result.success).toBe(true)
  })

  it('accepts a phone at the 20-digit maximum boundary', () => {
    const result = profileSchema.safeParse(base({ phone: '1'.repeat(20) }))
    expect(result.success).toBe(true)
  })

  it('treats a dial-code-only value (e.g. "+49") as empty rather than an invalid phone', () => {
    const result = profileSchema.safeParse(base({ phone: '+49' }))
    expect(result.success).toBe(true)
  })

  it('strips internal spaces before validating (e.g. "+49 170 1234567")', () => {
    const result = profileSchema.safeParse(base({ phone: '+49 170 1234567' }))
    expect(result.success).toBe(true)
  })
})

describe('profileSchema — email', () => {
  it('rejects an invalid email even though the field is read-only in the UI (schema is still enforced)', () => {
    const result = profileSchema.safeParse(base({ email: 'not-an-email' }))
    expect(result.success).toBe(false)
  })
})
