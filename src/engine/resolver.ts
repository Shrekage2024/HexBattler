import type { PlayerId } from '@/domain/ids';
import type { PlannedProgram, ResolvedFrameStep } from '@/domain/program';
import type { Frame, SymbolInstance } from '@/domain/cards';

export type RoundContext = {
  players: PlayerId[];
  programsByPlayer: Record<PlayerId, PlannedProgram | undefined>;
  frameIndex?: number;
};

const getInitiativeScore = (program?: PlannedProgram): number => {
  if (!program) return 0;
  const { rotation, movement, ability } = program.cards;
  return (rotation?.initiative ?? 0) + (movement?.initiative ?? 0) + (ability?.initiative ?? 0);
};

const getFrameSymbolsFromCard = (frames: Frame[] | undefined, frameIndex: number) => {
  if (!frames || frames.length === 0) return [];
  return frames.filter((frame) => frame.index === frameIndex).flatMap((frame) => frame.symbols);
};

export const computeInitiativeOrder = (ctx: RoundContext): PlayerId[] => {
  const seatOrder = new Map<PlayerId, number>();
  ctx.players.forEach((playerId, index) => seatOrder.set(playerId, index));
  return [...ctx.players].sort((a, b) => {
    const scoreDiff = getInitiativeScore(ctx.programsByPlayer[b]) - getInitiativeScore(ctx.programsByPlayer[a]);
    if (scoreDiff !== 0) return scoreDiff;
    return (seatOrder.get(a) ?? 0) - (seatOrder.get(b) ?? 0);
  });
};

export const getFrameSymbols = (program: PlannedProgram | undefined, frameIndex: number): SymbolInstance[] => {
  if (!program) return [];
  const { rotation, movement, ability } = program.cards;
  return [
    ...getFrameSymbolsFromCard(rotation?.frames, frameIndex),
    ...getFrameSymbolsFromCard(movement?.frames, frameIndex),
    ...getFrameSymbolsFromCard(ability?.frames, frameIndex),
  ];
};

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

const getRoundMaxFrames = (ctx: RoundContext): number => {
  return ctx.players.reduce((max, playerId) => {
    const program = ctx.programsByPlayer[playerId];
    return Math.max(max, getProgramMaxFrames(program));
  }, 0);
};

export const resolveFrame = (ctx: RoundContext, frameIndex: number): ResolvedFrameStep[] => {
  const order = computeInitiativeOrder(ctx);
  const steps: ResolvedFrameStep[] = [];
  order.forEach((playerId) => {
    const program = ctx.programsByPlayer[playerId];
    const symbols = getFrameSymbols(program, frameIndex);
    if (symbols.length === 0) return;
    steps.push({
      frameIndex,
      playerId,
      sourceCardIds: {
        rotation: program?.cards.rotation?.cardId,
        movement: program?.cards.movement?.cardId,
        ability: program?.cards.ability?.cardId,
      },
      symbols,
    });
  });
  return steps;
};

export const resolveNext = (
  ctx: RoundContext
): { frameIndex: number; steps: ResolvedFrameStep[]; done: boolean } => {
  const frameIndex = ctx.frameIndex ?? 1;
  const steps = resolveFrame(ctx, frameIndex);
  const maxFrames = getRoundMaxFrames(ctx);
  const done = frameIndex >= maxFrames;
  return { frameIndex, steps, done };
};

export interface Resolver {
  computeInitiativeOrder: (ctx: RoundContext) => PlayerId[];
  resolveFrame: (ctx: RoundContext, frameIndex: number) => ResolvedFrameStep[];
  resolveNext: (ctx: RoundContext) => { frameIndex: number; steps: ResolvedFrameStep[]; done: boolean };
}

export const createResolver = (): Resolver => ({
  computeInitiativeOrder,
  resolveFrame,
  resolveNext,
});
