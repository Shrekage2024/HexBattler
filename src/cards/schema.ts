import type {
  AttackParams,
  BlockParams,
  Direction,
  MoveParams,
  SymbolId,
  SymbolInstance,
  SymbolInstanceBase,
  WithTextParams,
} from './symbols';
import { isSymbolId } from './symbols';
import type { Card, CardBase, CardType, Frame } from './types';

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

const directions: Direction[] = ['F', 'FL', 'FR', 'B', 'BL', 'BR'];
const attackPatterns: AttackParams['pattern'][] = ['frontArc', 'adjacent', 'custom'];

const addError = (errors: ValidationError[], cardId: string, path: string, expected: string, value: unknown) => {
  errors.push({ cardId, path, expected, received: getType(value) });
};

const isDirection = (value: unknown): value is Direction => isString(value) && directions.includes(value as Direction);

const isMoveParams = (value: unknown): value is MoveParams =>
  isObject(value) && isDirection(value.direction) && isNumber(value.distance);

const isBlockParams = (value: unknown): value is BlockParams => isObject(value) && isDirection(value.edge);

const isAttackParams = (value: unknown): value is AttackParams => {
  if (!isObject(value) || !isString(value.pattern) || !attackPatterns.includes(value.pattern as AttackParams['pattern'])) {
    return false;
  }
  if (value.offsets === undefined) return true;
  if (!Array.isArray(value.offsets)) return false;
  return value.offsets.every(
    (offset) => isObject(offset) && isNumber(offset.q) && isNumber(offset.r)
  );
};

const validateSymbolParams = (id: SymbolId, params: unknown): boolean => {
  switch (id) {
    case 'WAIT':
    case 'TEXT_ACTIVE':
    case 'TEXT_PASSIVE':
    case 'CONCENTRATION':
    case 'COMBO':
    case 'REFRESH':
      return params === undefined;
    case 'MOVE':
    case 'JUMP':
      return isMoveParams(params);
    case 'ATTACK':
    case 'CHARGE':
      return isAttackParams(params);
    case 'BLOCK':
      return isBlockParams(params);
    case 'WITH_TEXT':
      return isWithTextParams(params);
    default:
      return false;
  }
};

const isBaseSymbolInstance = (value: unknown): value is SymbolInstanceBase => {
  if (!isObject(value) || !isString(value.id) || !isSymbolId(value.id)) return false;
  if (value.id === 'WITH_TEXT') return false;
  return validateSymbolParams(value.id, value.params);
};

const isWithTextParams = (value: unknown): value is WithTextParams =>
  isObject(value) &&
  (value.kind === 'active' || value.kind === 'passive') &&
  isBaseSymbolInstance(value.inner);

const parseSymbol = (value: unknown, cardId: string, path: string, errors: ValidationError[]): SymbolInstance | null => {
  if (!isObject(value)) {
    addError(errors, cardId, path, 'symbol object', value);
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
  if (!validateSymbolParams(value.id, value.params)) {
    addError(errors, cardId, `${path}.params`, `${value.id} params`, value.params);
    return null;
  }
  return value as SymbolInstance;
};

const parseFrame = (value: unknown, cardId: string, index: number, errors: ValidationError[]): Frame | null => {
  if (!isObject(value)) {
    addError(errors, cardId, `timeline[${index}]`, 'frame object', value);
    return null;
  }
  if (!isString(value.id)) {
    addError(errors, cardId, `timeline[${index}].id`, 'string', value.id);
  }
  if (!Array.isArray(value.symbols)) {
    addError(errors, cardId, `timeline[${index}].symbols`, 'array', value.symbols);
    return null;
  }
  const symbols = value.symbols
    .map((symbol, symbolIndex) => parseSymbol(symbol, cardId, `timeline[${index}].symbols[${symbolIndex}]`, errors))
    .filter((symbol): symbol is SymbolInstance => symbol !== null);

  return {
    id: isString(value.id) ? value.id : `frame-${index}`,
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
  if (!['ability', 'movement', 'rotation'].includes(cardType)) {
    addError(errors, cardId, 'cardType', 'ability | movement | rotation', value.cardType);
  }
  if (!isNumber(value.priority)) addError(errors, cardId, 'priority', 'number', value.priority);
  if (!isNumber(value.rotationAllowance)) {
    addError(errors, cardId, 'rotationAllowance', 'number', value.rotationAllowance);
  }
  if (!Array.isArray(value.timeline)) addError(errors, cardId, 'timeline', 'array', value.timeline);

  const frames = Array.isArray(value.timeline)
    ? value.timeline
        .map((frame, index) => parseFrame(frame, cardId, index, errors))
        .filter((frame): frame is Frame => frame !== null)
    : [];

  return {
    id: isString(value.id) ? value.id : cardId,
    cardType: cardType ?? 'ability',
    name: isString(value.name) ? value.name : 'Unknown',
    art: isString(value.art) ? value.art : undefined,
    priority: isNumber(value.priority) ? value.priority : 0,
    rotationAllowance: isNumber(value.rotationAllowance) ? value.rotationAllowance : 0,
    timeline: frames,
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

  if (base.cardType === 'ability') {
    if (!isObject(value) || !isNumber(value.damage)) {
      addError(errors, cardId, 'damage', 'number', isObject(value) ? value.damage : value);
    }
    if (!isObject(value) || !isNumber(value.knockbackFactor)) {
      addError(errors, cardId, 'knockbackFactor', 'number', isObject(value) ? value.knockbackFactor : value);
    }
    if (errors.length) return { success: false, errors };
    return {
      success: true,
      value: { ...base, damage: (value as { damage: number }).damage, knockbackFactor: (value as { knockbackFactor: number }).knockbackFactor },
    };
  }

  if (base.cardType === 'movement' || base.cardType === 'rotation') {
    const damage = isObject(value) && isNumber(value.damage) ? value.damage : undefined;
    const knockbackFactor = isObject(value) && isNumber(value.knockbackFactor) ? value.knockbackFactor : undefined;
    if (errors.length) return { success: false, errors };
    return {
      success: true,
      value: { ...base, cardType: base.cardType, damage, knockbackFactor },
    };
  }

  addError(errors, cardId, 'cardType', 'ability | movement | rotation', base.cardType);
  return { success: false, errors };
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
