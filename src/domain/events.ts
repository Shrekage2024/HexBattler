import type { PlayerId } from './ids';

export type GameEvent =
  | { type: 'PROGRAM_SUBMITTED'; playerId: PlayerId }
  | { type: 'ROUND_STARTED'; frameIndex: number }
  | { type: 'STEP_BEGAN'; frameIndex: number; playerId: PlayerId }
  | { type: 'STEP_CONFIRMED'; frameIndex: number; playerId: PlayerId }
  | { type: 'FRAME_ADVANCED'; frameIndex: number }
  | { type: 'ROUND_ENDED' }
  | { type: 'INFO'; msg?: string; at?: number };
