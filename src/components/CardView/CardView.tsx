import type { Card } from '@/cards/types';
import { FrameStrip } from './FrameStrip';

interface CardViewProps {
  card: Card;
}

const statValue = (value?: number) => (value === undefined ? '—' : value);

export const CardView = ({ card }: CardViewProps) => {
  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 shadow-lg backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{card.cardType} card</p>
          <h3 className="text-2xl font-semibold text-white">{card.name}</h3>
        </div>
        <div className="flex gap-2">
          <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
            Priority {card.priority}
          </span>
          <span className="rounded-full border border-indigo-400/40 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-200">
            Rot ±{card.rotationAllowance}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Damage</p>
          <p className="text-xl font-semibold text-rose-200">{statValue(card.damage)}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">KBF</p>
          <p className="text-xl font-semibold text-amber-200">{statValue(card.knockbackFactor)}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Frames</p>
          <p className="text-xl font-semibold text-slate-100">{card.timeline.length}</p>
        </div>
      </div>

      <div className="mt-4">
        <FrameStrip frames={card.timeline} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Active text</p>
          <p className="mt-2 text-sm text-slate-200">{card.activeText ?? '—'}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Passive text</p>
          <p className="mt-2 text-sm text-slate-200">{card.passiveText ?? '—'}</p>
        </div>
      </div>
    </section>
  );
};
