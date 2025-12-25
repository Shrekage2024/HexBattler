import type { GameEvent } from '@/domain/events';
import type { GameIntent } from '@/domain/intent';
import type { GameState } from '@/domain/state';

export interface GameReducer {
  applyIntent: (state: GameState, intent: GameIntent) => { state: GameState; events: GameEvent[] };
}

export const createReducer = (): GameReducer => ({
  applyIntent: (state, intent) => {
    switch (intent.type) {
      case 'SELECT_HEX':
        return {
          state: {
            ...state,
            selection: {
              ...state.selection,
              selectedHex: intent.hex,
            },
          },
          events: [],
        };
      case 'SELECT_CARD':
        return {
          state: {
            ...state,
            selection: {
              ...state.selection,
              selectedCardId: intent.cardId,
              selectedFrameIndex: null,
            },
          },
          events: [],
        };
      case 'SELECT_FRAME':
        return {
          state: {
            ...state,
            selection: {
              ...state.selection,
              selectedFrameIndex: intent.frameIndex,
            },
          },
          events: [],
        };
      default:
        return { state, events: [] };
    }
  },
});
