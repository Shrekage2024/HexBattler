export type Direction = 'F' | 'FL' | 'FR' | 'B' | 'BL' | 'BR';
export type AttackPattern = 'frontArc' | 'adjacent' | 'custom';

export type SymbolId =
  | 'WAIT'
  | 'TEXT_ACTIVE'
  | 'TEXT_PASSIVE'
  | 'WITH_TEXT'
  | 'MOVE'
  | 'JUMP'
  | 'ATTACK'
  | 'CHARGE'
  | 'BLOCK'
  | 'CONCENTRATION'
  | 'COMBO'
  | 'REFRESH';

export type MoveParams = {
  direction: Direction;
  distance: number;
};

export type AttackParams = {
  pattern: AttackPattern;
  offsets?: Array<{ q: number; r: number }>;
};

export type BlockParams = {
  edge: Direction;
};

export type WithTextParams = {
  kind: 'active' | 'passive';
  inner: SymbolInstanceBase;
};

export type SymbolParamsMap = {
  WAIT: undefined;
  TEXT_ACTIVE: undefined;
  TEXT_PASSIVE: undefined;
  WITH_TEXT: WithTextParams;
  MOVE: MoveParams;
  JUMP: MoveParams;
  ATTACK: AttackParams;
  CHARGE: AttackParams;
  BLOCK: BlockParams;
  CONCENTRATION: undefined;
  COMBO: undefined;
  REFRESH: undefined;
};

export type BaseSymbolId = Exclude<SymbolId, 'WITH_TEXT'>;

export type SymbolInstanceBase = {
  [K in BaseSymbolId]: SymbolParamsMap[K] extends undefined ? { id: K } : { id: K; params: SymbolParamsMap[K] };
}[BaseSymbolId];

export type SymbolInstance =
  | SymbolInstanceBase
  | {
      id: 'WITH_TEXT';
      params: SymbolParamsMap['WITH_TEXT'];
    };

export type SymbolMeta = {
  id: SymbolId;
  label: string;
  description: string;
  category: 'action' | 'text' | 'utility';
};

export const symbolRegistry: Record<SymbolId, SymbolMeta> = {
  WAIT: {
    id: 'WAIT',
    label: 'Wait',
    description: 'Do nothing this frame.',
    category: 'action',
  },
  TEXT_ACTIVE: {
    id: 'TEXT_ACTIVE',
    label: 'Active Text',
    description: 'Read the active text for this frame.',
    category: 'text',
  },
  TEXT_PASSIVE: {
    id: 'TEXT_PASSIVE',
    label: 'Passive Text',
    description: 'Read the passive text for this frame.',
    category: 'text',
  },
  WITH_TEXT: {
    id: 'WITH_TEXT',
    label: 'Text Behind',
    description: 'Symbol resolves alongside its text marker.',
    category: 'text',
  },
  MOVE: {
    id: 'MOVE',
    label: 'Move',
    description: 'Move relative to facing.',
    category: 'action',
  },
  JUMP: {
    id: 'JUMP',
    label: 'Jump',
    description: 'Jump ignoring blocking.',
    category: 'action',
  },
  ATTACK: {
    id: 'ATTACK',
    label: 'Attack',
    description: 'Attack using a pattern.',
    category: 'action',
  },
  CHARGE: {
    id: 'CHARGE',
    label: 'Charge',
    description: 'Attack then move into the target hex.',
    category: 'action',
  },
  BLOCK: {
    id: 'BLOCK',
    label: 'Block',
    description: 'Block attacks from an edge.',
    category: 'utility',
  },
  CONCENTRATION: {
    id: 'CONCENTRATION',
    label: 'Concentration',
    description: 'Move card to concentration area.',
    category: 'utility',
  },
  COMBO: {
    id: 'COMBO',
    label: 'Combo',
    description: 'Optional chain into another combo card.',
    category: 'utility',
  },
  REFRESH: {
    id: 'REFRESH',
    label: 'Refresh',
    description: 'Refresh if on land.',
    category: 'utility',
  },
};

export const isSymbolId = (value: string): value is SymbolId =>
  Object.prototype.hasOwnProperty.call(symbolRegistry, value);
