import type { GameEvent } from '@/domain/events';
import type { GameIntent } from '@/domain/intent';
import type { GameState, ResolutionLogEntry, RoundState } from '@/domain/state';
import type { PlannedProgram } from '@/domain/program';
import type { Frame } from '@/domain/cards';
import { computeInitiativeOrder, resolveFrame } from './resolver';

const getMaxFrameIndex = (frames: Frame[] | undefined): number => {
  if (!frames || frames.length === 0) return 0;
  return frames.reduce((max, frame) => Math.max(max, frame.index), 0);
};

const getProgramMaxFrames = (program: PlannedProgram | undefined): number => {
  if (!program) return 0;
  const { rotation, movement, ability } = program.cards;
  return Math.max(
    getMaxFrameIndex(rotation?.frames),
    getMaxFrameIndex(movement?.frames),
    getMaxFrameIndex(ability?.frames)
  );
};

const getRoundMaxFrames = (state: GameState): number => {
  const programsByPlayer = state.programsByPlayer ?? {};
  return state.players.reduce((max, player) => {
    return Math.max(max, getProgramMaxFrames(programsByPlayer[player.id]));
  }, 0);
};

const buildStepLogEntry = (step: { frameIndex: number; playerId: string; symbols?: Array<{ id: string }> }) => {
  const symbolIds = step.symbols?.map((symbol) => symbol.id) ?? [];
  const entry: ResolutionLogEntry = {
    type: 'STEP_CONFIRMED',
    frameIndex: step.frameIndex,
    playerId: step.playerId,
    symbolIds,
    ts: Date.now(),
  };
  return entry;
};

const getNextFrameSteps = (state: GameState, startFrameIndex: number) => {
  const players = state.players.map((player) => player.id);
  const programsByPlayer = state.programsByPlayer ?? {};
  const maxFrames = getRoundMaxFrames(state);
  for (let frameIndex = startFrameIndex; frameIndex <= maxFrames; frameIndex += 1) {
    const steps = resolveFrame({ players, programsByPlayer }, frameIndex);
    if (steps.length > 0) {
      return { frameIndex, steps };
    }
  }
  return null;
};

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
        const program: PlannedProgram = intent.program;
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
        const nextFrameSteps = getNextFrameSteps(state, 1);
        return {
          state: {
            ...state,
            round: {
              status: nextFrameSteps ? 'resolving' : 'ended',
              frameIndex: nextFrameSteps?.frameIndex ?? 1,
              order,
              activeStep: nextFrameSteps ? { playerId: nextFrameSteps.steps[0].playerId, frameIndex: nextFrameSteps.frameIndex } : null,
              resolvedSteps: nextFrameSteps?.steps ?? [],
              stepCursor: 0,
            },
          },
          events: [{ type: 'ROUND_STARTED', frameIndex: 1 }],
        };
      }
      case 'CONTINUE_RESOLUTION': {
        const round = state.round;
        if (!round || round.status !== 'resolving') return { state, events: [] };
        const steps = round.resolvedSteps ?? [];
        const cursor = round.stepCursor ?? 0;
        const activeStepIndex = round.activeStep
          ? steps.findIndex(
              (step) => step.playerId === round.activeStep?.playerId && step.frameIndex === round.activeStep?.frameIndex
            )
          : cursor;
        if (!steps.length) {
          const nextFrameSteps = getNextFrameSteps(state, round.frameIndex);
          const nextRound: RoundState = nextFrameSteps
            ? {
                ...round,
                frameIndex: nextFrameSteps.frameIndex,
                resolvedSteps: nextFrameSteps.steps,
                stepCursor: 0,
                activeStep: {
                  playerId: nextFrameSteps.steps[0].playerId,
                  frameIndex: nextFrameSteps.frameIndex,
                },
              }
            : { ...round, status: 'ended', activeStep: null, resolvedSteps: [], stepCursor: 0 };
          return {
            state: {
              ...state,
              round: nextRound,
            },
            events: nextFrameSteps ? [] : [{ type: 'ROUND_ENDED' }],
          };
        }
        const currentStep = steps[activeStepIndex];
        const nextCursor = activeStepIndex + 1;
        const hasMoreSteps = nextCursor < steps.length;
        const logEntry = currentStep ? buildStepLogEntry(currentStep) : null;
        const events: GameEvent[] = currentStep
          ? [
              {
                type: 'STEP_CONFIRMED',
                frameIndex: currentStep.frameIndex,
                playerId: currentStep.playerId,
              },
            ]
          : [];
        if (hasMoreSteps) {
          const nextStep = steps[nextCursor];
          return {
            state: {
              ...state,
              round: {
                ...round,
                stepCursor: nextCursor,
                activeStep: { playerId: nextStep.playerId, frameIndex: nextStep.frameIndex },
              },
              log: logEntry ? [...state.log, logEntry] : state.log,
            },
            events,
          };
        }
        const nextFrameSteps = getNextFrameSteps(state, round.frameIndex + 1);
        if (nextFrameSteps) {
          events.push({ type: 'FRAME_ADVANCED', frameIndex: nextFrameSteps.frameIndex });
        } else {
          events.push({ type: 'ROUND_ENDED' });
        }
        return {
          state: {
            ...state,
            round: nextFrameSteps
              ? {
                  ...round,
                  frameIndex: nextFrameSteps.frameIndex,
                  resolvedSteps: nextFrameSteps.steps,
                  stepCursor: 0,
                  activeStep: {
                    playerId: nextFrameSteps.steps[0].playerId,
                    frameIndex: nextFrameSteps.frameIndex,
                  },
                }
              : {
                  ...round,
                  status: 'ended',
                  activeStep: null,
                  resolvedSteps: [],
                  stepCursor: 0,
                },
            log: logEntry ? [...state.log, logEntry] : state.log,
          },
          events,
        };
      }
      case 'END_ROUND':
        return {
          state: {
            ...state,
            round: state.round
              ? {
                  ...state.round,
                  status: 'ended',
                }
              : state.round,
          },
          events: [{ type: 'ROUND_ENDED' }],
        };
      case 'RESET_ROUND':
        return {
          state: {
            ...state,
            programsByPlayer: {},
            round: {
              status: 'planning',
              frameIndex: 1,
              order: [],
              resolvedSteps: [],
              activeStep: null,
              stepCursor: 0,
            },
            log: [],
          },
          events: [],
        };
      default:
        return { state, events: [] };
    }
  },
});
