export type SymbolCategory = 'movement' | 'attack' | 'state' | 'meta';

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

export type SymbolRender = {
  icon: IconKey;
  color: string;
  badge?: string;
};

export type SymbolMetaDefinition = {
  label: string;
  category: SymbolCategory;
  render: SymbolRender;
  engineHints?: {
    directional?: boolean;
    consumesFrame?: boolean;
  };
};

export const symbolRegistry = {
  WAIT: {
    label: 'Wait',
    category: 'state',
    render: { icon: 'wait', color: 'emerald' },
  },
  TEXT_ACTIVE: {
    label: 'Active Text',
    category: 'meta',
    render: { icon: 'textActive', color: 'emerald', badge: 'A' },
  },
  TEXT_PASSIVE: {
    label: 'Passive Text',
    category: 'meta',
    render: { icon: 'textPassive', color: 'indigo', badge: 'P' },
  },
  WITH_TEXT: {
    label: 'Text Behind',
    category: 'meta',
    render: { icon: 'unknown', color: 'slate' },
    engineHints: { consumesFrame: false },
  },
  MOVE: {
    label: 'Move',
    category: 'movement',
    render: { icon: 'move', color: 'emerald' },
    engineHints: { directional: true },
  },
  JUMP: {
    label: 'Jump',
    category: 'movement',
    render: { icon: 'jump', color: 'emerald' },
    engineHints: { directional: true },
  },
  ATTACK: {
    label: 'Attack',
    category: 'attack',
    render: { icon: 'attack', color: 'rose' },
    engineHints: { directional: true },
  },
  CHARGE: {
    label: 'Charge',
    category: 'attack',
    render: { icon: 'charge', color: 'amber' },
    engineHints: { directional: true },
  },
  BLOCK: {
    label: 'Block',
    category: 'state',
    render: { icon: 'block', color: 'indigo' },
    engineHints: { directional: true },
  },
  CONCENTRATION: {
    label: 'Concentration',
    category: 'state',
    render: { icon: 'concentration', color: 'emerald' },
  },
  COMBO: {
    label: 'Combo',
    category: 'meta',
    render: { icon: 'combo', color: 'indigo' },
  },
  REFRESH: {
    label: 'Refresh',
    category: 'state',
    render: { icon: 'refresh', color: 'emerald' },
  },
} as const satisfies Record<string, SymbolMetaDefinition>;

export type SymbolId = keyof typeof symbolRegistry;

export type SymbolMeta = SymbolMetaDefinition & { id: SymbolId };

export const isSymbolId = (value: string): value is SymbolId =>
  Object.prototype.hasOwnProperty.call(symbolRegistry, value);

export const getSymbolMeta = (id: string): SymbolMeta | undefined =>
  isSymbolId(id) ? { id, ...symbolRegistry[id] } : undefined;
