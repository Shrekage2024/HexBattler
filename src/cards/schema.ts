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
import { isSymbolId, symbolRegistry } from './symbols';
import type { Card, CardBase, CardType, Frame } from './types';

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

const isString = (value: unknown): value is string => typeof value === 'string';

const directions: Direction[] = ['F', 'FL', 'FR', 'B', 'BL', 'BR'];
const attackPatterns: AttackParams['pattern'][] = ['frontArc', 'adjacent', 'custom'];

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
    (offset) =>
      isObject(offset) && isNumber(offset.q) && isNumber(offset.r)
  );
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

const parseSymbol = (value: unknown): SymbolInstance => {
  if (!isObject(value) || !isString(value.id) || !isSymbolId(value.id)) {
    throw new Error('Invalid symbol id');
  }
  if (!validateSymbolParams(value.id, value.params)) {
    throw new Error(`Invalid params for symbol ${value.id}`);
  }
  return value as SymbolInstance;
};

const parseFrame = (value: unknown): Frame => {
  if (!isObject(value) || !isString(value.id) || !Array.isArray(value.symbols)) {
    throw new Error('Invalid frame structure');
  }
  return {
    id: value.id,
    symbols: value.symbols.map(parseSymbol),
  };
};

const parseBaseCard = (value: unknown): CardBase => {
  if (!isObject(value)) throw new Error('Card must be an object');
  const cardType = value.cardType as CardType;
  if (!['ability', 'movement', 'rotation'].includes(cardType)) {
    throw new Error('Invalid card type');
  }
  if (!isString(value.id) || !isString(value.name)) {
    throw new Error('Card requires id and name');
  }
  if (!isNumber(value.priority) || !isNumber(value.rotationAllowance)) {
    throw new Error('Card requires priority and rotationAllowance');
  }
  if (!Array.isArray(value.timeline)) {
    throw new Error('Card requires timeline');
  }

  return {
    id: value.id,
    cardType,
    name: value.name,
    art: isString(value.art) ? value.art : undefined,
    priority: value.priority,
    rotationAllowance: value.rotationAllowance,
    timeline: value.timeline.map(parseFrame),
    activeText: isString(value.activeText) ? value.activeText : undefined,
    passiveText: isString(value.passiveText) ? value.passiveText : undefined,
  };
};

export const parseCard = (value: unknown): Card => {
  const base = parseBaseCard(value);
  if (base.cardType === 'ability') {
    if (!isObject(value) || !isNumber(value.damage) || !isNumber(value.knockbackFactor)) {
      throw new Error('Ability card requires damage and knockbackFactor');
    }
    return { ...base, damage: value.damage, knockbackFactor: value.knockbackFactor };
  }
  if (base.cardType === 'movement') {
    const movementCard: Card = {
      ...base,
      cardType: 'movement',
      damage: isObject(value) && isNumber(value.damage) ? value.damage : undefined,
      knockbackFactor: isObject(value) && isNumber(value.knockbackFactor) ? value.knockbackFactor : undefined,
    };
    return movementCard;
  }
  if (base.cardType === 'rotation') {
    const rotationCard: Card = {
      ...base,
      cardType: 'rotation',
      damage: isObject(value) && isNumber(value.damage) ? value.damage : undefined,
      knockbackFactor: isObject(value) && isNumber(value.knockbackFactor) ? value.knockbackFactor : undefined,
    };
    return rotationCard;
  }
  throw new Error(`Unknown card type ${base.cardType}`);
};

export const getSymbolMeta = (id: SymbolId) => symbolRegistry[id];
