import { useState } from 'react';
import { GameTableLayout } from '@/components/GameTableLayout';
import type { CardDef } from '@/components/types';

const demoCards: CardDef[] = [
  {
    id: 'card-advance',
    name: 'Emerald Advance',
    priority: 4,
    rotation: 1,
    damage: 2,
    knockback: 1,
    frames: [
      {
        id: 'frame-1',
        symbols: [
          { type: 'move', label: 'Move' },
          { type: 'move', label: 'Move' },
        ],
      },
      {
        id: 'frame-2',
        symbols: [
          { type: 'rotate', label: 'Rotate' },
          { type: 'attack', label: 'Attack' },
        ],
      },
    ],
  },
  {
    id: 'card-lance',
    name: 'Violet Lance',
    priority: 6,
    rotation: 0,
    damage: 4,
    knockback: 2,
    frames: [
      {
        id: 'frame-1',
        symbols: [
          { type: 'attack', label: 'Attack' },
          { type: 'attack', label: 'Attack' },
        ],
      },
      {
        id: 'frame-2',
        symbols: [
          { type: 'wait', label: 'Wait' },
          { type: 'rotate', label: 'Rotate' },
        ],
      },
      {
        id: 'frame-3',
        symbols: [{ type: 'move', label: 'Move' }],
      },
    ],
  },
  {
    id: 'card-dash',
    name: 'Amber Dash',
    priority: 3,
    rotation: 2,
    damage: 1,
    knockback: 1,
    frames: [
      {
        id: 'frame-1',
        symbols: [
          { type: 'dash', label: 'Dash' },
          { type: 'move', label: 'Move' },
        ],
      },
      {
        id: 'frame-2',
        symbols: [{ type: 'rotate', label: 'Rotate' }],
      },
    ],
  },
  {
    id: 'card-hold',
    name: 'Silent Hold',
    priority: 2,
    rotation: 1,
    damage: 3,
    knockback: 0,
    frames: [
      {
        id: 'frame-1',
        symbols: [{ type: 'wait', label: 'Wait' }],
      },
      {
        id: 'frame-2',
        symbols: [
          { type: 'attack', label: 'Attack' },
          { type: 'rotate', label: 'Rotate' },
        ],
      },
    ],
  },
  {
    id: 'card-spiral',
    name: 'Indigo Spiral',
    priority: 5,
    rotation: 2,
    damage: 2,
    knockback: 2,
    frames: [
      {
        id: 'frame-1',
        symbols: [
          { type: 'rotate', label: 'Rotate' },
          { type: 'move', label: 'Move' },
        ],
      },
      {
        id: 'frame-2',
        symbols: [
          { type: 'attack', label: 'Attack' },
          { type: 'dash', label: 'Dash' },
        ],
      },
    ],
  },
  {
    id: 'card-guard',
    name: 'Rose Guard',
    priority: 1,
    rotation: 0,
    damage: 1,
    knockback: 0,
    frames: [
      {
        id: 'frame-1',
        symbols: [
          { type: 'wait', label: 'Wait' },
          { type: 'rotate', label: 'Rotate' },
        ],
      },
      {
        id: 'frame-2',
        symbols: [{ type: 'attack', label: 'Attack' }],
      },
    ],
  },
];

export const GamePage = () => {
  const [selectedCard, setSelectedCard] = useState<CardDef | null>(null);

  return (
    <GameTableLayout
      opponentName="Ashen Vanguard"
      opponentStatus="Ready"
      opponentHandCount={5}
      playerName="Commander Nyx"
      playerStatus="Planning"
      cards={demoCards}
      selectedCard={selectedCard}
      onSelectCard={setSelectedCard}
      gameTitle="Hexstrike Prototype"
      gameId="Table-07"
      phase="lobby"
    />
  );
};
