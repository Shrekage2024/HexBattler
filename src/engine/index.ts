import type { AxialCoord } from '@/types/game';

export type Direction = 0 | 1 | 2 | 3 | 4 | 5;
export type RelativeDirection = 'F' | 'FR' | 'BR' | 'B' | 'BL' | 'FL';

export interface EnginePiece {
  id: string;
  position: AxialCoord;
  facing: Direction;
}

export interface MoveCard {
  id: string;
  name: string;
  move: {
    relativeDirection: RelativeDirection;
    steps: number;
  };
  rotation: {
    maxSteps: number;
  };
}

export const directionVectors: AxialCoord[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

const relativeDirectionOffsets: Record<RelativeDirection, number> = {
  F: 0,
  FR: 1,
  BR: 2,
  B: 3,
  BL: 4,
  FL: 5,
};

export const directionLabels = ['E', 'SE', 'SW', 'W', 'NW', 'NE'] as const;

export const demoAdvanceCard: MoveCard = {
  id: 'advance',
  name: 'Advance',
  move: {
    relativeDirection: 'F',
    steps: 2,
  },
  rotation: {
    maxSteps: 1,
  },
};

export const resolveRelativeDirection = (facing: Direction, relative: RelativeDirection): Direction => {
  const offset = relativeDirectionOffsets[relative];
  return ((facing + offset + 6) % 6) as Direction;
};

export const getFacingOptions = (facing: Direction, maxSteps: number): Direction[] => {
  const options = new Set<Direction>();
  for (let step = -maxSteps; step <= maxSteps; step += 1) {
    options.add(((facing + step + 6) % 6) as Direction);
  }
  return Array.from(options);
};

const isWithinBoard = (coord: AxialCoord, radius: number) => {
  const distance = Math.max(Math.abs(coord.q), Math.abs(coord.r), Math.abs(coord.q + coord.r));
  return distance <= radius;
};

export const getLegalActions = ({
  piece,
  card,
  boardRadius,
  chosenFacing,
}: {
  piece: EnginePiece;
  card: MoveCard;
  boardRadius: number;
  chosenFacing?: Direction;
}) => {
  const facingOptions = getFacingOptions(piece.facing, card.rotation.maxSteps);
  const moveDestinations: AxialCoord[] = [];

  if (chosenFacing !== undefined) {
    const absoluteDirection = resolveRelativeDirection(chosenFacing, card.move.relativeDirection);
    const delta = directionVectors[absoluteDirection];
    const destination = {
      q: piece.position.q + delta.q * card.move.steps,
      r: piece.position.r + delta.r * card.move.steps,
    };

    if (isWithinBoard(destination, boardRadius)) {
      moveDestinations.push(destination);
    }
  }

  return { facingOptions, moveDestinations };
};

export const applyMove = ({
  piece,
  destination,
  facing,
}: {
  piece: EnginePiece;
  destination: AxialCoord;
  facing: Direction;
}): EnginePiece => ({
  ...piece,
  position: destination,
  facing,
});
