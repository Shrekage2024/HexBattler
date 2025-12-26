import type { GameEvent } from '@/domain/events';
import type { GameIntent } from '@/domain/intent';
import type { GameState } from '@/domain/state';
import type { PlannedProgram } from '@/domain/program';
import { computeInitiativeOrder, resolveNext } from './resolver';

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
      case 'SUBMIT_PROGRAM': {
        const program: PlannedProgram = {
          playerId: intent.playerId,
          cards: intent.cards,
        };
        return {
          state: {
            ...state,
            programsByPlayer: {
              ...(state.programsByPlayer ?? {}),
              [intent.playerId]: program,
            },
          },
          events: [{ type: 'PROGRAM_SUBMITTED', playerId: intent.playerId }],
        };
      }
      case 'START_ROUND': {
        const players = state.players.map((player) => player.id);
        const programsByPlayer = state.programsByPlayer ?? {};
        const order = computeInitiativeOrder({ players, programsByPlayer });
        return {
          state: {
            ...state,
            round: {
              status: 'RESOLVING',
              frameIndex: 1,
              order,
            },
          },
          events: [{ type: 'ROUND_STARTED', frameIndex: 1 }],
        };
      }
      case 'ADVANCE_FRAME': {
        if (!state.round) return { state, events: [] };
        const players = state.players.map((player) => player.id);
        const programsByPlayer = state.programsByPlayer ?? {};
        const result = resolveNext({ players, programsByPlayer, frameIndex: state.round.frameIndex });
        const nextFrameIndex = result.frameIndex + 1;
        return {
          state: {
            ...state,
            round: {
              ...state.round,
              frameIndex: nextFrameIndex,
              lastResolvedFrameIndex: result.frameIndex,
              lastResolvedSteps: result.steps,
              status: result.done ? 'COMPLETE' : 'RESOLVING',
            },
          },
          events: [{ type: 'FRAME_RESOLVED', frameIndex: result.frameIndex, steps: result.steps }],
        };
      }
      case 'END_ROUND':
        return {
          state: {
            ...state,
            round: state.round
              ? {
                  ...state.round,
                  status: 'COMPLETE',
                }
              : state.round,
          },
          events: [{ type: 'ROUND_ENDED' }],
        };
      default:
        return { state, events: [] };
    }
  },
});
