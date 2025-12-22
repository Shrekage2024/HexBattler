import type { Card, Frame } from '@/cards/types';
import { SymbolIcon } from './SymbolIcon';

interface CardFaceProps {
  card: Card;
  size?: 'compact' | 'full';
}

const statValue = (value?: number) => (value === undefined ? '-' : value);

const FrameRow = ({ symbols }: { symbols: Frame['symbols'] }) => (
  <div className="flex flex-wrap gap-1.5">
    {symbols.map((symbol, index) => (
      <div
        key={`${typeof symbol === 'string' ? symbol : symbol.id}-${index}`}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-slate-900/70"
      >
        <SymbolIcon symbol={symbol} />
      </div>
    ))}
  </div>
);

export const CardFace = ({ card, size = 'full' }: CardFaceProps) => {
  const isCompact = size === 'compact';
  const frameCount = card.framesCount ?? card.frames.length;
  const rotationValue = card.rotationAllowance ?? card.rotationModifier;
  const damage = 'damage' in card ? card.damage : undefined;
  const knockback = 'knockbackFactor' in card ? card.knockbackFactor : undefined;

  return (
    <article
      className={`relative flex aspect-[3/4] flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 shadow-xl ${
        isCompact ? 'w-40' : 'w-72'
      }`}
    >
      <div className="absolute inset-0 border border-white/10" />
      <div className={`relative flex items-start justify-between gap-3 border-b border-white/10 bg-slate-950/80 ${isCompact ? 'p-2' : 'p-3'}`}>
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">{card.cardType}</p>
          <h3 className={`${isCompact ? 'text-base' : 'text-xl'} font-semibold text-white`}>{card.name}</h3>
        </div>
        <div className="flex flex-col items-end gap-1 text-[10px] uppercase tracking-[0.2em] text-slate-200">
          {card.number ? (
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">{card.number}</span>
          ) : null}
          {card.priority !== undefined ? (
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-200">PRI {card.priority}</span>
          ) : null}
          {rotationValue !== undefined ? (
            <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-indigo-200">ROT {rotationValue}</span>
          ) : null}
        </div>
      </div>

      <div className={`relative flex flex-1 gap-3 ${isCompact ? 'p-2' : 'p-3'}`}>
        <div className="flex w-20 flex-col gap-2">
          {card.frames.map((frame) => (
            <div key={`frame-${card.id}-${frame.index}`} className="rounded-lg border border-white/10 bg-slate-950/70 p-1.5">
              <p className="text-[9px] uppercase tracking-[0.3em] text-slate-500">F{frame.index}</p>
              <div className="mt-1.5">
                <FrameRow symbols={frame.symbols} />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <div
            className={`flex-1 rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/70 via-slate-900/70 to-slate-950/70 ${
              card.art ? 'bg-cover bg-center' : ''
            }`}
            style={card.art ? { backgroundImage: `url(${card.art})` } : undefined}
          >
            {!card.art && (
              <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.3em] text-slate-500">
                Art placeholder
              </div>
            )}
          </div>
          {!isCompact && (
            <div className="grid gap-2">
              <div className="rounded-lg border border-white/10 bg-slate-950/60 p-2">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Active</p>
                <p className="mt-1 text-sm text-slate-200">{card.activeText ?? '-'}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-slate-950/60 p-2">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Passive</p>
                <p className="mt-1 text-sm text-slate-200">{card.passiveText ?? '-'}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`relative flex items-center justify-between border-t border-white/10 bg-slate-950/80 ${isCompact ? 'px-2 py-2' : 'px-3 py-2'}`}>
        <div className="flex gap-2 text-[10px] uppercase tracking-[0.2em]">
          {damage !== undefined ? (
            <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-rose-200">DMG {statValue(damage)}</span>
          ) : null}
          {knockback !== undefined ? (
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-200">KBF {statValue(knockback)}</span>
          ) : null}
        </div>
        <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">{frameCount}F</span>
      </div>
    </article>
  );
};
