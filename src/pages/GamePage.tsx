import { useMemo, useState } from 'react';
import { sampleCardData } from '@/cards/sampleContent';
import { parseCards } from '@/cards/schema';
import type { Card } from '@/cards/types';
import { GameTableLayout } from '@/components/GameTable/GameTableLayout';
import { previewEngine } from '@/app/engine';
import type { Axial } from '@/lib/geometry';

export const GamePage = () => {
  const parsedCards = parseCards(sampleCardData);
  const playerHand = parsedCards.success ? parsedCards.value : [];
  const defaultCardId = playerHand[0]?.id ?? '';
  const [selectedCardId, setSelectedCardId] = useState<string>(defaultCardId);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number | null>(null);
  const [selectedCell, setSelectedCell] = useState<Axial | null>(null);
  if (!parsedCards.success && import.meta.env.DEV) {
    console.warn('[GameTable] Sample card data failed validation.');
  }

  const previewHighlightedCells = useMemo(() => {
    return previewEngine.getPreview({ selectedHex: selectedCell, selectedFrameIndex }).highlighted;
  }, [selectedCell, selectedFrameIndex]);

  return (
    <GameTableLayout
      opponentHandCount={5}
      playerHand={playerHand as Card[]}
      selectedCardId={selectedCardId}
      onSelectCard={(id) => {
        setSelectedCardId(id);
        setSelectedFrameIndex(null);
      }}
      selectedFrameIndex={selectedFrameIndex}
      onSelectFrame={setSelectedFrameIndex}
      highlightedCells={previewHighlightedCells}
      onSelectedCellChange={setSelectedCell}
    />
  );
};
