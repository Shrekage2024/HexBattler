import type { CardId, PlayerId } from './ids';
import type { Frame, SymbolInstance } from './cards';

export type InitiativeScore = number;

export interface ProgramCardRef {
  cardId: CardId;
  initiative?: InitiativeScore;
  frames?: Frame[];
}

export interface ProgramCardRefs {
  rotation?: ProgramCardRef | null;
  movement?: ProgramCardRef | null;
  ability?: ProgramCardRef | null;
}

export interface PlannedProgram {
  playerId: PlayerId;
  cards: ProgramCardRefs;
}

export interface ResolvedFrameStep {
  frameIndex: number;
  playerId: PlayerId;
  sourceCardIds: {
    rotation?: CardId;
    movement?: CardId;
    ability?: CardId;
  };
  symbols: SymbolInstance[];
}
