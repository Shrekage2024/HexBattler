import type { PlayerId } from './ids';
import type { ResolvedFrameStep } from './program';

export type GameEvent =
  | { type: 'PROGRAM_SUBMITTED'; playerId: PlayerId }
  | { type: 'ROUND_STARTED'; frameIndex: number }
  | { type: 'FRAME_RESOLVED'; frameIndex: number; steps: ResolvedFrameStep[] }
  | { type: 'ROUND_ENDED' }
  | { type: 'INFO'; msg?: string; at?: number };
