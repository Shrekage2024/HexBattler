import type { CardId } from './ids';
import type { Primitive } from './primitives';

export type SymbolId = string;

export interface SymbolInstance {
  id: SymbolId;
  params?: Record<string, Primitive>;
}

export interface Frame {
  id: string;
  index: number;
  symbols: SymbolInstance[];
}

export type CardKind = 'ability' | 'movement' | 'utility';

export interface CardDef {
  id: CardId;
  name: string;
  kind: CardKind;
  frames: Frame[];
}
