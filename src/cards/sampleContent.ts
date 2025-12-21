import type { Card } from './types';
import { parseCard } from './schema';

export const sampleCards: Card[] = [
  parseCard({
    id: 'ability-frostline',
    cardType: 'ability',
    name: 'Frostline Lunge',
    priority: 5,
    rotationAllowance: 1,
    damage: 3,
    knockbackFactor: 2,
    activeText: 'After moving, you may rotate 60° toward a target.',
    passiveText: 'If the attack hits, gain 1 guard.',
    timeline: [
      {
        id: 'frostline-f1',
        symbols: [
          { id: 'MOVE', params: { direction: 'F', distance: 2 } },
          { id: 'TEXT_ACTIVE' },
        ],
      },
      {
        id: 'frostline-f2',
        symbols: [{ id: 'ATTACK', params: { pattern: 'frontArc' } }],
      },
      {
        id: 'frostline-f3',
        symbols: [
          {
            id: 'WITH_TEXT',
            params: {
              kind: 'passive',
              inner: { id: 'BLOCK', params: { edge: 'F' } },
            },
          },
        ],
      },
    ],
  }),
  parseCard({
    id: 'movement-veilstep',
    cardType: 'movement',
    name: 'Veil Step',
    priority: 3,
    rotationAllowance: 2,
    activeText: 'If you jump over a foe, draw a card.',
    timeline: [
      {
        id: 'veil-f1',
        symbols: [
          { id: 'JUMP', params: { direction: 'FR', distance: 1 } },
          { id: 'MOVE', params: { direction: 'F', distance: 1 } },
        ],
      },
      {
        id: 'veil-f2',
        symbols: [{ id: 'WAIT' }],
      },
      {
        id: 'veil-f3',
        symbols: [{ id: 'TEXT_ACTIVE' }],
      },
    ],
  }),
  parseCard({
    id: 'rotation-pivot',
    cardType: 'rotation',
    name: 'Pivot Spiral',
    priority: 2,
    rotationAllowance: 2,
    passiveText: 'Rotate freely while concentrated.',
    timeline: [
      {
        id: 'pivot-f1',
        symbols: [
          { id: 'CONCENTRATION' },
          { id: 'COMBO' },
        ],
      },
      {
        id: 'pivot-f2',
        symbols: [{ id: 'CHARGE', params: { pattern: 'adjacent' } }],
      },
      {
        id: 'pivot-f3',
        symbols: [{ id: 'REFRESH' }],
      },
    ],
  }),
];
