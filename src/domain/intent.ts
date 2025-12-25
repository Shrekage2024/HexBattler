import type { CardId, PlayerId } from './ids';
import type { Axial } from './hex';

export type GameIntent =
  | { type: 'SELECT_HEX'; playerId: PlayerId; hex: Axial | null }
  | { type: 'SELECT_CARD'; playerId: PlayerId; cardId: CardId | null }
  | { type: 'SELECT_FRAME'; playerId: PlayerId; frameIndex: number | null }
  | { type: 'SUBMIT_PROGRAM'; playerId: PlayerId; cardId: CardId; frameIndex: number | null }
  | { type: 'END_TURN'; playerId: PlayerId };
