import type { SymbolInstance, WithTextParams } from '@/cards/symbols';
import { getSymbolMeta } from '@/cards/symbols';
import type { IconKey } from '@/cards/symbols';

const iconBase = 'h-4 w-4 text-emerald-200';

const WithTextBadge = ({ kind }: { kind: 'active' | 'passive' }) => (
  <span className="absolute -right-1 -top-1 rounded-full bg-slate-950/80 px-1 text-[8px] font-semibold text-emerald-200">
    {kind === 'active' ? 'A' : 'P'}
  </span>
);

const UnknownGlyph = () => (
  <div className="rounded-md border border-rose-400/40 bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-rose-200">
    ???
  </div>
);

const iconFromKey = (iconKey: IconKey) => {
  switch (iconKey) {
    case 'wait':
      return (
        <svg viewBox="0 0 24 24" className={iconBase} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v5l3 2" strokeLinecap="round" />
        </svg>
      );
    case 'textActive':
      return (
        <div className="rounded-md border border-emerald-400/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-200">
          ACT
        </div>
      );
    case 'textPassive':
      return (
        <div className="rounded-md border border-indigo-400/40 bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-200">
          PAS
        </div>
      );
    case 'move':
      return (
        <svg viewBox="0 0 24 24" className={iconBase} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 12h12" strokeLinecap="round" />
          <path d="M12 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'jump':
      return (
        <svg viewBox="0 0 24 24" className={iconBase} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 16c4-8 8-8 12 0" strokeLinecap="round" />
          <path d="M16 8l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'attack':
      return (
        <svg viewBox="0 0 24 24" className={iconBase} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3l7 4v10l-7 4-7-4V7l7-4z" strokeLinejoin="round" />
          <path d="M8 8l8 8" strokeLinecap="round" />
        </svg>
      );
    case 'charge':
      return (
        <svg viewBox="0 0 24 24" className={iconBase} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 12h10" strokeLinecap="round" />
          <path d="M12 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 5l8 14" strokeLinecap="round" />
        </svg>
      );
    case 'block':
      return (
        <svg viewBox="0 0 24 24" className={iconBase} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3l7 4v5c0 4-3 7-7 9-4-2-7-5-7-9V7l7-4z" />
        </svg>
      );
    case 'concentration':
      return (
        <svg viewBox="0 0 24 24" className={iconBase} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
        </svg>
      );
    case 'combo':
      return (
        <svg viewBox="0 0 24 24" className={iconBase} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 7h4a4 4 0 010 8H7" strokeLinecap="round" />
          <path d="M17 7h-4a4 4 0 000 8h4" strokeLinecap="round" />
        </svg>
      );
    case 'refresh':
      return (
        <svg viewBox="0 0 24 24" className={iconBase} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 12a8 8 0 0114-5" strokeLinecap="round" />
          <path d="M18 4v4h-4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 12a8 8 0 01-14 5" strokeLinecap="round" />
          <path d="M6 20v-4h4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'unknown':
      return <UnknownGlyph />;
    default:
      return <UnknownGlyph />;
  }
};

export const SymbolIcon = ({ symbol }: { symbol: SymbolInstance | { id: string; params?: unknown } }) => {
  if (symbol.id === 'WITH_TEXT') {
    const params = symbol.params as WithTextParams;
    return (
      <div className="relative">
        <SymbolIcon symbol={params.inner} />
        <WithTextBadge kind={params.kind} />
      </div>
    );
  }

  const meta = getSymbolMeta(symbol.id);
  if (!meta) {
    if (import.meta.env.DEV) {
      console.error(`[CardDemo] Unknown symbol id "${symbol.id}" encountered.`);
    }
    return <UnknownGlyph />;
  }

  return iconFromKey(meta.iconKey);
};
