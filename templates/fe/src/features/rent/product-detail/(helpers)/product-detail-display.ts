export const hasDisplayValue = (value: unknown) =>
  value != null && (typeof value !== 'string' || !['', '-'].includes(value.trim()))
