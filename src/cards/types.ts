import type { SymbolId } from './symbols';

export type CardType = 'ability' | 'movement' | 'rotation' | 'attack' | 'utility';

export type SymbolInstance = {
  id: SymbolId;
  params?: Record<string, number | string | boolean>;
};

export type Frame = {
  index: number;
  symbols: SymbolInstance[];
};

export type CardBase = {
  id: string;
  cardType: CardType;
  name: string;
  number?: string;
  art?: string;
  cost?: number;
  priority?: number;
  rotationAllowance?: number;
  rotationModifier?: number;
  frames: Frame[];
  framesCount?: number;
  activeText?: string;
  passiveText?: string;
};

export type AbilityCard = CardBase & {
  cardType: 'ability';
  damage?: number;
  knockbackFactor?: number;
};

export type MovementCard = CardBase & {
  cardType: 'movement';
  damage?: number;
  knockbackFactor?: number;
};

export type RotationCard = CardBase & {
  cardType: 'rotation';
  damage?: number;
  knockbackFactor?: number;
};

export type AttackCard = CardBase & {
  cardType: 'attack';
  damage?: number;
  knockbackFactor?: number;
};

export type UtilityCard = CardBase & {
  cardType: 'utility';
};

export type Card = AbilityCard | MovementCard | RotationCard | AttackCard | UtilityCard;
