import { useState } from 'react';
import type { Card } from '@/cards/types';
import { sampleCardData } from '@/cards/sampleContent';
import { parseCards, type ValidationError } from '@/cards/schema';
import { formatValidationErrors } from '@/cards/formatValidationError';
import { CardFace } from '@/components/CardView/CardFace';
import { CardBack } from '@/components/CardView/CardBack';

const opponentHandCount = 5;
let demoCards: Card[] = [];
let sampleErrors: ValidationError[] = [];

try {
  const parsedSamples = parseCards(sampleCardData);
  if (!parsedSamples.success) {
    sampleErrors = parsedSamples.errors;
    const errorSummary = formatValidationErrors(parsedSamples.errors);
    if (import.meta.env.DEV) {
      console.warn(`[CardDemo] Sample card validation failed:\n${errorSummary}`);
    }
    if (import.meta.env.DEV) {
      console.info(
        'Fix src/cards/sampleContent.ts (params must be record of string|number|boolean) and reload.'
      );
    }
  } else {
    demoCards = parsedSamples.value;
  }
} catch (error) {
  sampleErrors = [
    {
      cardId: 'unknown',
      path: 'sampleContent',
      expected: 'valid card data',
      received: error instanceof Error ? error.message : 'unknown error',
    },
  ];
}

export const CardDemoPage = () => {
  const [selectedCard, setSelectedCard] = useState<Card | null>(demoCards[0] ?? null);

  return (
    <div className="min-h-screen bg-[#0b111e] px-6 py-10 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Card schema demo</p>
          <h1 className="text-3xl font-semibold text-white">Frame Symbols Preview</h1>
        </header>

        {sampleErrors.length ? (
          <section className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-rose-100 shadow-lg">
            <p className="text-xs uppercase tracking-[0.3em] text-rose-200">Sample data error</p>
            <div className="mt-3 space-y-2 text-sm text-rose-100">
              {sampleErrors.map((error, index) => (
                <div key={`${error.cardId}-${error.path}-${index}`} className="rounded-lg bg-rose-500/10 p-2">
                  <p>
                    <span className="font-semibold">Card:</span> {error.cardId}
                  </p>
                  <p>
                    <span className="font-semibold">Path:</span> {error.path}
                  </p>
                  <p>
                    <span className="font-semibold">Expected:</span> {error.expected}
                  </p>
                  <p>
                    <span className="font-semibold">Received:</span> {error.received}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-rose-200">
              Fix the sample card data in src/cards/sampleContent.ts and reload.
            </p>
            <p className="text-xs text-rose-200">Params must be record of string|number|boolean.</p>
          </section>
        ) : null}

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
              <CardBack key={`opponent-card-${index}`} size="compact" />
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
                className={`rounded-2xl border p-2 text-left transition ${
                  selectedCard?.id === card.id
                    ? 'border-emerald-400/60 bg-emerald-500/10'
                    : 'border-white/10 bg-slate-950/40 hover:border-emerald-300/40'
                }`}
              >
                <CardFace card={card} size="compact" />
              </button>
            ))}
          </div>
        </section>

        {selectedCard ? (
          <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Selected card</p>
                <p className="text-sm text-slate-200">Full details</p>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <CardFace card={selectedCard} />
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
};
