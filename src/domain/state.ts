import type { CardId, CharacterId, PlayerId } from './ids';
import type { Axial } from './hex';
import type { PlannedProgram, ResolvedFrameStep } from './program';

export type Phase = 'setup' | 'planning' | 'reveal' | 'resolve' | 'complete';

export interface AbilityDeckState {
  drawPile: CardId[];
  discardPile: CardId[];
}

export interface MovementState {
  selectedHex?: Axial | null;
  selectedFrameIndex?: number | null;
}

export interface CharacterState {
  id: CharacterId;
  ownerId: PlayerId;
  position: Axial;
  facing?: number;
}

export interface PlayerState {
  id: PlayerId;
  name: string;
  hand: CardId[];
  characters: CharacterId[];
}

export interface RoundState {
  status: 'planning' | 'resolving' | 'ended';
  frameIndex: number;
  order: PlayerId[];
  resolvedSteps?: ResolvedFrameStep[];
  activeStep?: { playerId: PlayerId; frameIndex: number } | null;
  stepCursor?: number;
}

export interface ResolutionLogEntry {
  type: string;
  frameIndex: number;
  playerId: PlayerId;
  symbolIds: string[];
  ts: number;
}

export interface GameState {
  id: string;
  phase: Phase;
  activePlayerId?: PlayerId;
  players: PlayerState[];
  characters: CharacterState[];
  abilityDeck: AbilityDeckState;
  movement?: MovementState;
  programsByPlayer?: Record<PlayerId, PlannedProgram | undefined>;
  round?: RoundState;
  log: ResolutionLogEntry[];
  selection?: {
    selectedHex?: Axial | null;
    selectedCardId?: CardId | null;
    selectedFrameIndex?: number | null;
  };
}
