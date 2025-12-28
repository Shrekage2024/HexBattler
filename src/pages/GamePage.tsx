import { useMemo, useState } from 'react';
import { sampleCardData } from '@/cards/sampleContent';
import { parseCards } from '@/cards/schema';
import type { Card } from '@/cards/types';
import { GameTableLayout } from '@/components/GameTable/GameTableLayout';
import { previewEngine, reducer, resolver } from '@/app/engine';
import type { PlayerId } from '@/domain/ids';
import type { GameIntent } from '@/domain/intent';
import type { PlannedProgram } from '@/domain/program';
import type { Frame as DomainFrame, SymbolInstance as DomainSymbolInstance } from '@/domain/cards';
import type { GameState } from '@/domain/state';
import type { Axial } from '@/lib/geometry';

type ProgramSelection = {
  rotationId: string;
  movementId: string;
  abilityId: string;
};

const buildDomainFrames = (card: Card): DomainFrame[] =>
  card.frames.map((frame) => ({
    id: `${card.id}-frame-${frame.index}`,
    index: frame.index,
    symbols: frame.symbols.map((symbol) => ({
      id: symbol.id,
      params: symbol.params as DomainSymbolInstance['params'],
    })),
  }));

export const GamePage = () => {
  const parsedCards = useMemo(() => parseCards(sampleCardData), []);
  const playerHand = useMemo(() => (parsedCards.success ? parsedCards.value : []), [parsedCards]);
  const playerIds = useMemo<PlayerId[]>(() => ['P1', 'P2'], []);
  const defaultCardId = playerHand[0]?.id ?? '';
  const [selectedCardId, setSelectedCardId] = useState<string>(defaultCardId);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number | null>(null);
  const [selectedCell, setSelectedCell] = useState<Axial | null>(null);
  const [programSelection, setProgramSelection] = useState<ProgramSelection>(() => ({
    rotationId: '',
    movementId: '',
    abilityId: '',
  }));
  const [gameState, setGameState] = useState<GameState>(() => ({
    id: 'local',
    phase: 'planning',
    players: playerIds.map((id) => ({ id, name: id, hand: [], characters: [] })),
    characters: [],
    abilityDeck: { drawPile: [], discardPile: [] },
    programsByPlayer: {},
    round: {
      status: 'planning',
      frameIndex: 1,
      order: [],
      activeStep: null,
      resolvedSteps: [],
      stepCursor: 0,
    },
    log: [],
  }));
  if (!parsedCards.success && import.meta.env.DEV) {
    console.warn('[GameTable] Sample card data failed validation.');
  }

  const cardLookup = useMemo(() => {
    const map = new Map<string, Card>();
    playerHand.forEach((card) => map.set(card.id, card));
    return map;
  }, [playerHand]);

  const cardOptions = useMemo(() => {
    return {
      rotation: playerHand.filter((card) => card.cardType === 'rotation'),
      movement: playerHand.filter((card) => card.cardType === 'movement'),
      ability: playerHand.filter((card) => card.cardType === 'ability'),
    };
  }, [playerHand]);

  const dispatchIntent = (intent: GameIntent) => {
    setGameState((prev) => reducer.applyIntent(prev, intent).state);
  };

  const dispatchIntents = (intents: GameIntent[]) => {
    setGameState((prev) => {
      let nextState = prev;
      intents.forEach((intent) => {
        nextState = reducer.applyIntent(nextState, intent).state;
      });
      return nextState;
    });
  };

  const buildProgram = (playerId: PlayerId, selection: ProgramSelection): PlannedProgram => {
    const rotation = selection.rotationId ? cardLookup.get(selection.rotationId) : undefined;
    const movement = selection.movementId ? cardLookup.get(selection.movementId) : undefined;
    const ability = selection.abilityId ? cardLookup.get(selection.abilityId) : undefined;
    return {
      playerId,
      cards: {
        rotation: rotation
          ? {
              cardId: rotation.id,
              initiative: rotation.priority ?? 0,
              frames: buildDomainFrames(rotation),
            }
          : null,
        movement: movement
          ? {
              cardId: movement.id,
              initiative: movement.priority ?? 0,
              frames: buildDomainFrames(movement),
            }
          : null,
        ability: ability
          ? {
              cardId: ability.id,
              initiative: ability.priority ?? 0,
              frames: buildDomainFrames(ability),
            }
          : null,
      },
    };
  };

  const programsByPlayer = useMemo(() => gameState.programsByPlayer ?? {}, [gameState.programsByPlayer]);
  const initiativeOrder = useMemo(() => {
    return resolver.computeInitiativeOrder({ players: playerIds, programsByPlayer });
  }, [playerIds, programsByPlayer]);

  const round = gameState.round;
  const resolvedSteps = round?.resolvedSteps ?? [];
  const activeStep = round?.activeStep ?? null;
  const activeStepDetail = activeStep
    ? resolvedSteps.find(
        (step) => step.playerId === activeStep.playerId && step.frameIndex === activeStep.frameIndex
      )
    : null;
  const roundStatus = round?.status ?? 'planning';
  const isP1Committed = Boolean(programsByPlayer.P1);
  const isP2Committed = Boolean(programsByPlayer.P2);
  const canCommitP1 = Boolean(!isP1Committed && programSelection.movementId && programSelection.abilityId);
  const canAutofillP2 = Boolean(isP1Committed && !isP2Committed);
  const isResolving = roundStatus === 'resolving';
  const isRoundComplete = roundStatus === 'ended';


  const previewHighlightedCells = useMemo(() => {
    return previewEngine.getPreview({ selectedHex: selectedCell, selectedFrameIndex }).highlighted;
  }, [selectedCell, selectedFrameIndex]);

  return (
    <GameTableLayout
      opponentHandCount={5}
      playerHand={playerHand as Card[]}
      selectedCardId={selectedCardId}
      onSelectCard={(id) => {
        const card = cardLookup.get(id);
        if (card && !isP1Committed) {
          if (card.cardType === 'rotation') {
            setProgramSelection((prev) => ({ ...prev, rotationId: card.id }));
          }
          if (card.cardType === 'movement') {
            setProgramSelection((prev) => ({ ...prev, movementId: card.id }));
          }
          if (card.cardType === 'ability') {
            setProgramSelection((prev) => ({ ...prev, abilityId: card.id }));
          }
        }
        setSelectedCardId(id);
        setSelectedFrameIndex(null);
      }}
      selectedFrameIndex={selectedFrameIndex}
      onSelectFrame={setSelectedFrameIndex}
      highlightedCells={previewHighlightedCells}
      onSelectedCellChange={setSelectedCell}
      programSelection={programSelection}
      canCommitP1={canCommitP1}
      isP1Committed={isP1Committed}
      isP2Committed={isP2Committed}
      onCommitP1={() => {
        if (!canCommitP1) return;
        const program = buildProgram('P1', programSelection);
        dispatchIntent({ type: 'SUBMIT_PROGRAM', playerId: 'P1', program });
      }}
      onAutofillP2={() => {
        if (!canAutofillP2) return;
        const autoSelection: ProgramSelection = {
          rotationId: cardOptions.rotation[0]?.id ?? '',
          movementId: cardOptions.movement[0]?.id ?? '',
          abilityId: cardOptions.ability[0]?.id ?? '',
        };
        const program = buildProgram('P2', autoSelection);
        dispatchIntents([
          { type: 'SUBMIT_PROGRAM', playerId: 'P2', program },
          ...(roundStatus === 'planning' ? [{ type: 'START_ROUND' } as const] : []),
        ]);
      }}
      initiativeOrder={initiativeOrder}
      round={round ?? null}
      activeStep={activeStep}
      activeStepSymbols={activeStepDetail?.symbols ?? []}
      logEntries={gameState.log}
      isResolving={isResolving}
      isRoundComplete={isRoundComplete}
      onContinue={() => dispatchIntent({ type: 'CONTINUE_RESOLUTION' })}
      onNextRound={() => {
        setProgramSelection({ rotationId: '', movementId: '', abilityId: '' });
        dispatchIntent({ type: 'RESET_ROUND' });
      }}
    />
  );
};
