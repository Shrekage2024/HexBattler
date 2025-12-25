import type { GameIntent } from '@/domain/intent';
import type { PlayerId } from '@/domain/ids';
import type { GameState } from '@/domain/state';
import type { ValidationResult } from '@/domain/validation';

export interface RulesEngine {
  getLegalIntents: (state: GameState, playerId: PlayerId) => GameIntent[];
  validateIntent: (state: GameState, playerId: PlayerId, intent: GameIntent) => ValidationResult;
}

export const createRulesEngine = (): RulesEngine => ({
  getLegalIntents: () => [],
  validateIntent: () => ({ ok: true }),
});
