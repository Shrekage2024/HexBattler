import { useMemo } from 'react';
import type { Card } from '@/cards/types';
import { CardBack } from '@/components/CardView/CardBack';
import { CardFace } from '@/components/CardView/CardFace';
import { FrameStrip } from '@/components/CardView/FrameStrip';
import { HexBoardPanel } from '@/components/HexBoardPanel';

interface GameTableLayoutProps {
  opponentHandCount: number;
  playerHand: Card[];
  selectedCardId?: string;
  onSelectCard?: (id: string) => void;
  selectedFrameIndex?: number | null;
  onSelectFrame?: (index: number) => void;
  highlightedCells?: Set<string>;
  onSelectedCellChange?: (cell: { q: number; r: number } | null) => void;
}

export const GameTableLayout = ({
  opponentHandCount,
  playerHand,
  selectedCardId,
  onSelectCard,
  selectedFrameIndex,
  onSelectFrame,
  highlightedCells,
  onSelectedCellChange,
}: GameTableLayoutProps) => {
  const selectedCard = useMemo(
    () => playerHand.find((card) => card.id === selectedCardId) ?? playerHand[0] ?? null,
    [playerHand, selectedCardId]
  );

  return (
    <div className="min-h-screen bg-[#0b111e] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.12),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.12),transparent_35%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-6 py-8 lg:flex-row">
        <main className="flex flex-1 flex-col gap-6">
          <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Opponent (hidden)</p>
                <p className="text-sm text-slate-200">Hand: {opponentHandCount}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {Array.from({ length: opponentHandCount }).map((_, index) => (
                <CardBack key={`opponent-card-${index}`} size="compact" />
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 shadow-lg backdrop-blur">
            <HexBoardPanel radius={4} highlightedCells={highlightedCells} onSelectedCellChange={onSelectedCellChange} />
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Your hand</p>
                <p className="text-sm text-slate-200">Select a card to preview</p>
              </div>
            </div>
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {playerHand.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => onSelectCard?.(card.id)}
                  className={`rounded-2xl border p-2 text-left transition ${
                    card.id === selectedCard?.id
                      ? 'border-emerald-400/60 bg-emerald-500/10'
                      : 'border-white/10 bg-slate-950/40 hover:border-emerald-300/40'
                  }`}
                >
                  <CardFace card={card} size="compact" />
                </button>
              ))}
            </div>
          </section>
        </main>

        <aside className="w-full max-w-xl lg:w-[360px]">
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 shadow-lg backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Selected card</p>
            <div className="mt-4 flex justify-center">
              {selectedCard ? <CardFace card={selectedCard} /> : null}
            </div>
            {selectedCard ? (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Frames</p>
                <FrameStrip
                  frames={selectedCard.frames}
                  selectedIndex={selectedFrameIndex ?? null}
                  onSelectFrame={onSelectFrame}
                />
                {selectedFrameIndex !== null && selectedFrameIndex !== undefined ? (
                  <p className="mt-2 text-xs text-slate-400">Selected frame: {selectedFrameIndex}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
};
