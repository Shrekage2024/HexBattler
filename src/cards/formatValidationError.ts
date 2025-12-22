import type { ValidationError } from './schema';

export const formatValidationError = (error: ValidationError) =>
  `[${error.cardId}] ${error.path} expected ${error.expected}, got ${error.received}`;

export const formatValidationErrors = (errors: ValidationError[]) =>
  errors.map(formatValidationError).join('\n');
