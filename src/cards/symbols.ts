export type Direction = 'F' | 'FL' | 'FR' | 'B' | 'BL' | 'BR';
export type AttackPattern = 'frontArc' | 'adjacent' | 'custom';

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

export type IconKey =
  | 'wait'
  | 'textActive'
  | 'textPassive'
  | 'move'
  | 'jump'
  | 'attack'
  | 'charge'
  | 'block'
  | 'concentration'
  | 'combo'
  | 'refresh'
  | 'unknown';

export type SymbolRenderMode = 'standard' | 'textMarker' | 'withText';

export type SymbolMetaDefinition = {
  label: string;
  description: string;
  category: 'action' | 'text' | 'utility';
  iconKey: IconKey;
  renderMode: SymbolRenderMode;
};

export const symbolRegistry = {
  WAIT: {
    label: 'Wait',
    description: 'Do nothing this frame.',
    category: 'action',
    iconKey: 'wait',
    renderMode: 'standard',
  },
  TEXT_ACTIVE: {
    label: 'Active Text',
    description: 'Read the active text for this frame.',
    category: 'text',
    iconKey: 'textActive',
    renderMode: 'textMarker',
  },
  TEXT_PASSIVE: {
    label: 'Passive Text',
    description: 'Read the passive text for this frame.',
    category: 'text',
    iconKey: 'textPassive',
    renderMode: 'textMarker',
  },
  WITH_TEXT: {
    label: 'Text Behind',
    description: 'Symbol resolves alongside its text marker.',
    category: 'text',
    iconKey: 'unknown',
    renderMode: 'withText',
  },
  MOVE: {
    label: 'Move',
    description: 'Move relative to facing.',
    category: 'action',
    iconKey: 'move',
    renderMode: 'standard',
  },
  JUMP: {
    label: 'Jump',
    description: 'Jump ignoring blocking.',
    category: 'action',
    iconKey: 'jump',
    renderMode: 'standard',
  },
  ATTACK: {
    label: 'Attack',
    description: 'Attack using a pattern.',
    category: 'action',
    iconKey: 'attack',
    renderMode: 'standard',
  },
  CHARGE: {
    label: 'Charge',
    description: 'Attack then move into the target hex.',
    category: 'action',
    iconKey: 'charge',
    renderMode: 'standard',
  },
  BLOCK: {
    label: 'Block',
    description: 'Block attacks from an edge.',
    category: 'utility',
    iconKey: 'block',
    renderMode: 'standard',
  },
  CONCENTRATION: {
    label: 'Concentration',
    description: 'Move card to concentration area.',
    category: 'utility',
    iconKey: 'concentration',
    renderMode: 'standard',
  },
  COMBO: {
    label: 'Combo',
    description: 'Optional chain into another combo card.',
    category: 'utility',
    iconKey: 'combo',
    renderMode: 'standard',
  },
  REFRESH: {
    label: 'Refresh',
    description: 'Refresh if on land.',
    category: 'utility',
    iconKey: 'refresh',
    renderMode: 'standard',
  },
} as const satisfies Record<string, SymbolMetaDefinition>;

export type SymbolId = keyof typeof symbolRegistry;

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

export type SymbolMeta = SymbolMetaDefinition & { id: SymbolId };

export const isSymbolId = (value: string): value is SymbolId =>
  Object.prototype.hasOwnProperty.call(symbolRegistry, value);

export const getSymbolMeta = (id: string): SymbolMeta | undefined =>
  isSymbolId(id) ? { id, ...symbolRegistry[id] } : undefined;
