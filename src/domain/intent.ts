import type { CardId, PlayerId } from './ids';
import type { Axial } from './hex';
import type { PlannedProgram } from './program';

export type GameIntent =
  | { type: 'SELECT_HEX'; playerId: PlayerId; hex: Axial | null }
  | { type: 'SELECT_CARD'; playerId: PlayerId; cardId: CardId | null }
  | { type: 'SELECT_FRAME'; playerId: PlayerId; frameIndex: number | null }
  | { type: 'SUBMIT_PROGRAM'; playerId: PlayerId; program: PlannedProgram }
  | { type: 'START_ROUND' }
  | { type: 'CONTINUE_RESOLUTION' }
  | { type: 'END_ROUND' }
  | { type: 'RESET_ROUND' }
  | { type: 'END_TURN'; playerId: PlayerId };
