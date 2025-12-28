import { useMemo } from 'react';
import type { Card } from '@/cards/types';
import { CardBack } from '@/components/CardView/CardBack';
import { CardFace } from '@/components/CardView/CardFace';
import { FrameStrip } from '@/components/CardView/FrameStrip';
import { HexBoardPanel } from '@/components/HexBoardPanel';
import type { PlayerId } from '@/domain/ids';
import type { ResolutionLogEntry, RoundState } from '@/domain/state';
import type { SymbolInstance } from '@/domain/cards';

interface GameTableLayoutProps {
  opponentHandCount: number;
  playerHand: Card[];
  selectedCardId?: string;
  onSelectCard?: (id: string) => void;
  selectedFrameIndex?: number | null;
  onSelectFrame?: (index: number) => void;
  highlightedCells?: Set<string>;
  onSelectedCellChange?: (cell: { q: number; r: number } | null) => void;
  programSelection: {
    rotationId: string;
    movementId: string;
    abilityId: string;
  };
  canCommitP1: boolean;
  isP1Committed: boolean;
  isP2Committed: boolean;
  onCommitP1: () => void;
  onAutofillP2: () => void;
  initiativeOrder: PlayerId[];
  round: RoundState | null;
  activeStep: { playerId: PlayerId; frameIndex: number } | null;
  activeStepSymbols: SymbolInstance[];
  logEntries: ResolutionLogEntry[];
  isResolving: boolean;
  isRoundComplete: boolean;
  onContinue: () => void;
  onNextRound: () => void;
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
  programSelection,
  canCommitP1,
  isP1Committed,
  isP2Committed,
  onCommitP1,
  onAutofillP2,
  initiativeOrder,
  round,
  activeStep,
  activeStepSymbols,
  logEntries,
  isResolving,
  isRoundComplete,
  onContinue,
  onNextRound,
}: GameTableLayoutProps) => {
  const selectedCard = useMemo(
    () => playerHand.find((card) => card.id === selectedCardId) ?? playerHand[0] ?? null,
    [playerHand, selectedCardId]
  );
  const selectedRotation = useMemo(
    () => playerHand.find((card) => card.id === programSelection.rotationId) ?? null,
    [playerHand, programSelection.rotationId]
  );
  const selectedMovement = useMemo(
    () => playerHand.find((card) => card.id === programSelection.movementId) ?? null,
    [playerHand, programSelection.movementId]
  );
  const selectedAbility = useMemo(
    () => playerHand.find((card) => card.id === programSelection.abilityId) ?? null,
    [playerHand, programSelection.abilityId]
  );
  const canContinue = Boolean(isResolving);
  const canAutofillP2 = isP1Committed && !isP2Committed;

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

        <aside className="w-full max-w-xl space-y-6 lg:w-[360px]">
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

          {!isResolving && !isRoundComplete ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 shadow-lg backdrop-blur">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Planning</p>
              <p className="mt-2 text-xs text-slate-400">Click cards to fill the slots for P1.</p>
              <div className="mt-4 space-y-3 text-sm text-slate-200">
                <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Rotation</p>
                  <p className="mt-1 text-sm text-slate-200">{selectedRotation?.name ?? 'Select a rotation card'}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Movement</p>
                  <p className="mt-1 text-sm text-slate-200">{selectedMovement?.name ?? 'Select a movement card'}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Ability</p>
                  <p className="mt-1 text-sm text-slate-200">{selectedAbility?.name ?? 'Select an ability card'}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">Attack/Utility cards are not used in v0.</p>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={onCommitP1}
                  disabled={!canCommitP1}
                  className={`rounded-lg border px-3 py-2 text-sm transition ${
                    canCommitP1
                      ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100 hover:border-emerald-300/60'
                      : 'border-white/10 bg-slate-950/50 text-slate-500'
                  }`}
                >
                  {isP1Committed ? 'P1 committed ✅' : 'Commit Program (P1)'}
                </button>
                {!canCommitP1 && !isP1Committed ? (
                  <p className="text-xs text-slate-500">Select a movement + ability card to commit.</p>
                ) : null}
                <button
                  type="button"
                  onClick={onAutofillP2}
                  disabled={!canAutofillP2}
                  className={`rounded-lg border px-3 py-2 text-sm transition ${
                    canAutofillP2
                      ? 'border-white/10 bg-slate-950/70 text-slate-200 hover:border-emerald-300/40'
                      : 'border-white/10 bg-slate-950/50 text-slate-500'
                  }`}
                >
                  {isP2Committed ? 'P2 committed ✅' : 'Autofill & Commit (P2)'}
                </button>
                {!canAutofillP2 && !isP2Committed ? (
                  <p className="text-xs text-slate-500">Commit P1 first.</p>
                ) : null}
              </div>
            </div>
          ) : null}

          {isResolving || isRoundComplete ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 shadow-lg backdrop-blur">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Resolution</p>
              <div className="mt-3 space-y-2 text-sm text-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Frame</span>
                  <span className="text-sm text-slate-200">{round?.frameIndex ?? '-'}</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Initiative order</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
                    {initiativeOrder.length === 0 ? (
                      <span className="rounded-full border border-white/10 px-2 py-1 text-slate-400">Waiting</span>
                    ) : (
                      initiativeOrder.map((playerId, index) => (
                        <span
                          key={`initiative-${playerId}`}
                          className="rounded-full border border-white/10 bg-white/5 px-2 py-1"
                        >
                          {index + 1}. {playerId}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Current step</p>
                  {activeStep ? (
                    <div className="mt-2 space-y-2 text-sm text-slate-200">
                      <p>
                        Player <span className="font-semibold">{activeStep.playerId}</span> • Frame{' '}
                        <span className="font-semibold">{activeStep.frameIndex}</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {activeStepSymbols.length === 0 ? (
                          <span className="text-xs text-slate-400">No symbols</span>
                        ) : (
                          activeStepSymbols.map((symbol, index) => (
                            <span
                              key={`active-symbol-${symbol.id}-${index}`}
                              className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs"
                            >
                              {symbol.id}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-slate-400">No active step.</p>
                  )}
                </div>
              </div>
              {isRoundComplete ? (
                <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                  Round complete
                </div>
              ) : null}
              <div className="mt-4 grid gap-2">
                <button
                  type="button"
                  onClick={onContinue}
                  disabled={!canContinue || isRoundComplete}
                  className={`rounded-lg border px-3 py-2 text-sm transition ${
                    canContinue && !isRoundComplete
                      ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100 hover:border-emerald-300/60'
                      : 'border-white/10 bg-slate-950/50 text-slate-500'
                  }`}
                >
                  Continue
                </button>
                {isRoundComplete ? (
                  <button
                    type="button"
                    onClick={onNextRound}
                    className="rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 transition hover:border-emerald-300/40"
                  >
                    Next Round
                  </button>
                ) : null}
              </div>
              <div className="mt-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Resolution log</p>
                <div className="mt-2 space-y-2 text-xs text-slate-300">
                  {logEntries.length === 0 ? (
                    <p className="text-slate-400">No steps confirmed yet.</p>
                  ) : (
                    [...logEntries]
                      .slice(-10)
                      .reverse()
                      .map((entry, index) => (
                        <div
                          key={`log-${entry.ts}-${index}`}
                          className="rounded-lg border border-white/10 bg-slate-950/60 px-2 py-2"
                        >
                          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                            Frame {entry.frameIndex}
                          </p>
                          <p className="mt-1">
                            {entry.playerId} • {entry.symbolIds.length ? entry.symbolIds.join(', ') : 'No symbols'}
                          </p>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
};
