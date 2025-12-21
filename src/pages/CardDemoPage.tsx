import { useState } from 'react';
import type { Card } from '@/cards/types';
import { sampleCardData } from '@/cards/sampleContent';
import { formatValidationErrors, parseCards } from '@/cards/schema';
import { CardView } from '@/components/CardView/CardView';

const opponentHandCount = 5;
const parsedSamples = parseCards(sampleCardData);

if (!parsedSamples.success) {
  const errorMessage = formatValidationErrors(parsedSamples.errors);
  if (import.meta.env.DEV) {
    throw new Error(`[CardDemo] Invalid sample card data:\n${errorMessage}`);
  } else {
    console.error(`[CardDemo] Invalid sample card data:\n${errorMessage}`);
  }
}

const demoCards = parsedSamples.success ? parsedSamples.value : [];

export const CardDemoPage = () => {
  const [selectedCard, setSelectedCard] = useState<Card>(demoCards[0]);

  return (
    <div className="min-h-screen bg-[#0b111e] px-6 py-10 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Card schema demo</p>
          <h1 className="text-3xl font-semibold text-white">Frame Symbols Preview</h1>
        </header>

        <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Opponent hand</p>
              <p className="text-sm text-slate-200">Hidden cards ({opponentHandCount})</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-200">
              Hand: {opponentHandCount}
            </span>
          </div>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {Array.from({ length: opponentHandCount }).map((_, index) => (
              <div
                key={`opponent-card-${index}`}
                className="h-24 w-16 rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-slate-950/80"
              />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Your hand</p>
              <p className="text-sm text-slate-200">Face-up cards</p>
            </div>
          </div>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {demoCards.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => setSelectedCard(card)}
                className={`min-w-[160px] rounded-xl border p-3 text-left transition ${
                  selectedCard?.id === card.id
                    ? 'border-emerald-400/60 bg-emerald-500/10'
                    : 'border-white/10 bg-slate-950/40 hover:border-emerald-300/40'
                }`}
              >
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{card.cardType}</p>
                <p className="text-lg font-semibold text-white">{card.name}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-200">
                    PRI {card.priority}
                  </span>
                  <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-indigo-200">
                    ROT +/-{card.rotationAllowance}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {selectedCard ? <CardView card={selectedCard} /> : null}
      </div>
    </div>
  );
};
