import type { SymbolInstance } from './symbols';

export type CardType = 'ability' | 'movement' | 'rotation';

export type Frame = {
  id: string;
  symbols: SymbolInstance[];
};

export type CardBase = {
  id: string;
  cardType: CardType;
  name: string;
  art?: string;
  priority: number;
  rotationAllowance: number;
  timeline: Frame[];
  activeText?: string;
  passiveText?: string;
};

export type AbilityCard = CardBase & {
  cardType: 'ability';
  damage: number;
  knockbackFactor: number;
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

export type Card = AbilityCard | MovementCard | RotationCard;
