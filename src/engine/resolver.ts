import type { GameEvent } from '@/domain/events';
import type { GameState } from '@/domain/state';

export interface Resolver {
  getInitiativeOrder: (state: GameState) => string[];
  resolveNextStep: (state: GameState) => { state: GameState; events: GameEvent[] };
}

export const createResolver = (): Resolver => ({
  getInitiativeOrder: (state) => state.players.map((player) => player.id),
  resolveNextStep: (state) => ({ state, events: [] }),
});
