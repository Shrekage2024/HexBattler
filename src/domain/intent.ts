import type { CardId, PlayerId } from './ids';
import type { Axial } from './hex';
import type { ProgramCardRefs } from './program';

export type GameIntent =
  | { type: 'SELECT_HEX'; playerId: PlayerId; hex: Axial | null }
  | { type: 'SELECT_CARD'; playerId: PlayerId; cardId: CardId | null }
  | { type: 'SELECT_FRAME'; playerId: PlayerId; frameIndex: number | null }
  | { type: 'SUBMIT_PROGRAM'; playerId: PlayerId; cards: ProgramCardRefs }
  | { type: 'START_ROUND' }
  | { type: 'ADVANCE_FRAME' }
  | { type: 'END_ROUND' }
  | { type: 'END_TURN'; playerId: PlayerId };
