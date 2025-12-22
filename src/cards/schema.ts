import { isSymbolId } from './symbols';
import type { Card, CardBase, CardType, Frame, SymbolInstance } from './types';

export type ValidationError = {
  cardId: string;
  path: string;
  expected: string;
  received: string;
};

type ValidationResult<T> =
  | { success: true; value: T }
  | { success: false; errors: ValidationError[] };

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

const isString = (value: unknown): value is string => typeof value === 'string';

const getType = (value: unknown) => {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
};

const addError = (errors: ValidationError[], cardId: string, path: string, expected: string, value: unknown) => {
  errors.push({ cardId, path, expected, received: getType(value) });
};

const validateSymbolParams = (params: unknown): boolean => {
  if (params === undefined) return true;
  if (!isObject(params)) return false;
  return Object.values(params).every(
    (value) => isString(value) || isNumber(value) || typeof value === 'boolean'
  );
};

const parseSymbol = (value: unknown, cardId: string, path: string, errors: ValidationError[]): SymbolInstance | null => {
  if (isString(value)) {
    if (!isSymbolId(value)) {
      addError(errors, cardId, path, 'known symbol id', value);
      return null;
    }
    return { id: value } as SymbolInstance;
  }
  if (!isObject(value)) {
    addError(errors, cardId, path, 'symbol object or string', value);
    return null;
  }
  if (!isString(value.id)) {
    addError(errors, cardId, `${path}.id`, 'string', value.id);
    return null;
  }
  if (!isSymbolId(value.id)) {
    addError(errors, cardId, `${path}.id`, 'known symbol id', value.id);
    return null;
  }
  if (!validateSymbolParams(value.params)) {
    addError(errors, cardId, `${path}.params`, 'record of string | number | boolean', value.params);
    return null;
  }
  return value as SymbolInstance;
};

const parseFrame = (value: unknown, cardId: string, index: number, errors: ValidationError[]): Frame | null => {
  if (!isObject(value)) {
    addError(errors, cardId, `frames[${index}]`, 'frame object', value);
    return null;
  }
  if (!isNumber(value.index)) {
    addError(errors, cardId, `frames[${index}].index`, 'number', value.index);
  }
  if (!Array.isArray(value.symbols)) {
    addError(errors, cardId, `frames[${index}].symbols`, 'array', value.symbols);
    return null;
  }
  const symbols = value.symbols
    .map((symbol, symbolIndex) => parseSymbol(symbol, cardId, `frames[${index}].symbols[${symbolIndex}]`, errors))
    .filter((symbol): symbol is SymbolInstance => symbol !== null);
  return {
    index: isNumber(value.index) ? value.index : index,
    symbols,
  };
};

const parseBaseCard = (value: unknown, errors: ValidationError[]): CardBase | null => {
  if (!isObject(value)) {
    addError(errors, 'unknown', 'card', 'object', value);
    return null;
  }
  const cardId = isString(value.id) ? value.id : 'unknown';
  if (!isString(value.id)) addError(errors, cardId, 'id', 'string', value.id);
  if (!isString(value.name)) addError(errors, cardId, 'name', 'string', value.name);

  const cardType = value.cardType as CardType;
  if (!['ability', 'movement', 'rotation', 'attack', 'utility'].includes(cardType)) {
    addError(errors, cardId, 'cardType', 'ability | movement | rotation | attack | utility', value.cardType);
  }
  if (value.priority !== undefined && !isNumber(value.priority)) {
    addError(errors, cardId, 'priority', 'number', value.priority);
  }
  if (value.rotationAllowance !== undefined && !isNumber(value.rotationAllowance)) {
    addError(errors, cardId, 'rotationAllowance', 'number', value.rotationAllowance);
  }
  if (value.rotationModifier !== undefined && !isNumber(value.rotationModifier)) {
    addError(errors, cardId, 'rotationModifier', 'number', value.rotationModifier);
  }
  if (value.cost !== undefined && !isNumber(value.cost)) {
    addError(errors, cardId, 'cost', 'number', value.cost);
  }
  if (value.number !== undefined && !isString(value.number) && !isNumber(value.number)) {
    addError(errors, cardId, 'number', 'string | number', value.number);
  }
  if (!Array.isArray(value.frames)) addError(errors, cardId, 'frames', 'array', value.frames);

  const frames = Array.isArray(value.frames)
    ? value.frames
        .map((frame, index) => parseFrame(frame, cardId, index, errors))
        .filter((frame): frame is Frame => frame !== null)
    : [];

  return {
    id: isString(value.id) ? value.id : cardId,
    cardType: cardType ?? 'ability',
    name: isString(value.name) ? value.name : 'Unknown',
    number: isString(value.number) || isNumber(value.number) ? `${value.number}` : undefined,
    art: isString(value.art) ? value.art : undefined,
    cost: isNumber(value.cost) ? value.cost : undefined,
    priority: isNumber(value.priority) ? value.priority : undefined,
    rotationAllowance: isNumber(value.rotationAllowance) ? value.rotationAllowance : undefined,
    rotationModifier: isNumber(value.rotationModifier) ? value.rotationModifier : undefined,
    frames,
    framesCount: isNumber(value.framesCount) ? value.framesCount : undefined,
    activeText: isString(value.activeText) ? value.activeText : undefined,
    passiveText: isString(value.passiveText) ? value.passiveText : undefined,
  };
};

export const parseCard = (value: unknown): ValidationResult<Card> => {
  const errors: ValidationError[] = [];
  const base = parseBaseCard(value, errors);
  if (!base) {
    return { success: false, errors };
  }
  const cardId = base.id;

  const record = isObject(value) ? value : null;
  const damage = record && isNumber(record.damage) ? record.damage : undefined;
  const knockbackFactor = record && isNumber(record.knockbackFactor) ? record.knockbackFactor : undefined;
  if (record && record.damage !== undefined && !isNumber(record.damage)) {
    addError(errors, cardId, 'damage', 'number', record.damage);
  }
  if (record && record.knockbackFactor !== undefined && !isNumber(record.knockbackFactor)) {
    addError(errors, cardId, 'knockbackFactor', 'number', record.knockbackFactor);
  }

  if (errors.length) return { success: false, errors };
  return {
    success: true,
    value: { ...base, cardType: base.cardType, damage, knockbackFactor },
  };
};

export const parseCards = (values: unknown[]): ValidationResult<Card[]> => {
  const parsedCards: Card[] = [];
  const errors: ValidationError[] = [];

  values.forEach((value) => {
    const result = parseCard(value);
    if (result.success) {
      parsedCards.push(result.value);
    } else {
      errors.push(...result.errors);
    }
  });

  if (errors.length) return { success: false, errors };
  return { success: true, value: parsedCards };
};

export const cardSchema = {
  safeParse: parseCard,
};

export const cardArraySchema = {
  safeParse: parseCards,
};

export const formatValidationErrors = (errors: ValidationError[]) =>
  errors
    .map((error) => `[${error.cardId}] ${error.path} expected ${error.expected}, got ${error.received}`)
    .join('\n');

export const isSymbolRegistered = (id: string) => isSymbolId(id);
