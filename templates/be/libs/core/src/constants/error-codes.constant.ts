/**
 * Shared error codes used by global guards and cross-cutting concerns.
 * Domain-specific error codes live in their respective feature module constants.
 */
export const COMMON_ERROR_CODES = {
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  FORBIDDEN: 'FORBIDDEN',
} as const;
