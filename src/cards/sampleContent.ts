export const sampleCardData: unknown[] = [
  {
    id: 'ability-frostline',
    cardType: 'ability',
    name: 'Frostline Lunge',
    number: 'A-02',
    priority: 5,
    rotationAllowance: 1,
    damage: 3,
    knockbackFactor: 2,
    activeText: 'After moving, you may rotate 60 deg toward a target.',
    passiveText: 'If the attack hits, gain 1 guard.',
    frames: [
      {
        index: 1,
        symbols: [
          { id: 'MOVE', params: { direction: 'F', distance: 2 } },
          { id: 'TEXT_ACTIVE' },
        ],
      },
      {
        index: 2,
        symbols: [{ id: 'ATTACK', params: { power: 2 } }],
      },
      {
        index: 3,
        symbols: [
          { id: 'WITH_TEXT', params: { inner: 'BLOCK', kind: 'passive' } },
          { id: 'TEXT_PASSIVE' },
        ],
      },
    ],
  },
  {
    id: 'movement-veilstep',
    cardType: 'movement',
    name: 'Veil Step',
    number: 'M-04',
    priority: 3,
    rotationAllowance: 2,
    activeText: 'If you jump over a foe, draw a card.',
    frames: [
      {
        index: 1,
        symbols: [
          { id: 'JUMP', params: { direction: 'FR', distance: 1 } },
          { id: 'MOVE', params: { direction: 'F', distance: 1 } },
        ],
      },
      {
        index: 2,
        symbols: [{ id: 'WAIT' }],
      },
      {
        index: 3,
        symbols: [{ id: 'TEXT_ACTIVE' }],
      },
    ],
  },
  {
    id: 'attack-pivot',
    cardType: 'attack',
    name: 'Pivot Spiral',
    number: 'AT-07',
    priority: 2,
    rotationAllowance: 2,
    passiveText: 'Rotate freely while concentrated.',
    frames: [
      {
        index: 1,
        symbols: [{ id: 'CONCENTRATION' }, { id: 'COMBO' }],
      },
      {
        index: 2,
        symbols: [{ id: 'CHARGE', params: { power: 1 } }],
      },
      {
        index: 3,
        symbols: [{ id: 'REFRESH' }],
      },
    ],
  },
];
