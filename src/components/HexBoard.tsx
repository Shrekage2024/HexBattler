import { useMemo } from 'react';
import type { AxialCoord, Piece } from '@/types/game';
import { directionVectors } from '@/engine';
import { axialToPixel, boardViewBox, hexPolygonPoints, makeHexagonDisk } from '@/lib/geometry';

interface HexBoardProps {
  radius: number;
  pieces: Array<Piece & { facing?: number }>;
  selectedPieceId?: string;
  onSelectPiece?: (id: string) => void;
  previewMove?: { pieceId: string; to: AxialCoord } | null;
  highlightedHexes?: AxialCoord[];
  onHexClick?: (hex: AxialCoord) => void;
  selectedCell?: AxialCoord | null;
  highlightedCells?: Set<string> | string[];
  onCellClick?: (cell: AxialCoord) => void;
  className?: string;
}

const getDirectionVector = (facing: number) => directionVectors[((facing % 6) + 6) % 6];

const arrowPoints = (facing: number, size: number) => {
  const direction = getDirectionVector(facing);
  const { x: dx, y: dy } = axialToPixel({ q: direction.q, r: direction.r }, size);
  const length = Math.hypot(dx, dy);
  if (length === 0) return null;
  const ux = dx / length;
  const uy = dy / length;
  const arrowLength = 18;
  const arrowWidth = 6;
  const tipX = ux * arrowLength;
  const tipY = uy * arrowLength;
  const baseX = ux * (arrowLength - 6);
  const baseY = uy * (arrowLength - 6);
  const leftX = baseX - uy * arrowWidth;
  const leftY = baseY + ux * arrowWidth;
  const rightX = baseX + uy * arrowWidth;
  const rightY = baseY - ux * arrowWidth;

  return {
    lineEnd: { x: baseX, y: baseY },
    head: `${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`,
  };
};

export const HexBoard = ({
  radius,
  pieces,
  selectedPieceId,
  onSelectPiece,
  previewMove,
  highlightedHexes,
  onHexClick,
  selectedCell,
  highlightedCells,
  onCellClick,
  className,
}: HexBoardProps) => {
  const hexes = useMemo(() => makeHexagonDisk(radius), [radius]);
  const hexSize = 30;
  const polygonPoints = useMemo(() => hexPolygonPoints(hexSize), [hexSize]);
  const viewBox = useMemo(() => boardViewBox(radius, hexSize, 40), [radius, hexSize]);
  const cellKey = (q: number, r: number) => `${q},${r}`;
  const highlightLookup = useMemo(() => {
    return new Set((highlightedHexes ?? []).map((hex) => cellKey(hex.q, hex.r)));
  }, [highlightedHexes]);
  const highlightedCellSet = useMemo(() => {
    if (!highlightedCells) return new Set<string>();
    if (highlightedCells instanceof Set) return highlightedCells;
    return new Set(highlightedCells);
  }, [highlightedCells]);

  const containerClassName =
    className ??
    'relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-6';

  return (
    <div className={containerClassName}>
      <svg viewBox={viewBox} className="w-full">
        {hexes.map(({ q, r }) => {
          const { x, y } = axialToPixel({ q, r }, hexSize);
          const key = cellKey(q, r);
          const isHighlighted = highlightLookup.has(key);
          const isSoftHighlighted = highlightedCellSet.has(key);
          const isSelected = selectedCell?.q === q && selectedCell?.r === r;
          const canClick = Boolean(onCellClick) || (isHighlighted && Boolean(onHexClick));
          const handleCellClick = () => {
            onCellClick?.({ q, r });
            if (isHighlighted) onHexClick?.({ q, r });
          };
          return (
            <g key={key} transform={`translate(${x}, ${y})`}>
              <polygon
                points={polygonPoints}
                className={`${canClick ? 'cursor-pointer' : ''} ${
                  isHighlighted
                    ? 'fill-emerald-500/30 stroke-emerald-300/70'
                    : isSoftHighlighted
                    ? 'fill-emerald-400/15 stroke-emerald-200/50'
                    : 'fill-slate-800 stroke-slate-700'
                }`}
                strokeWidth="1.5"
                onClick={canClick ? handleCellClick : undefined}
              />
              {isSelected && (
                <polygon
                  points={polygonPoints}
                  className="fill-transparent stroke-emerald-200/80"
                  strokeWidth="2.5"
                />
              )}
              <text className="fill-slate-500 text-[10px]" textAnchor="middle" dy="4">
                {q},{r}
              </text>
            </g>
          );
        })}

        {pieces.map((piece) => {
          const moveTarget = previewMove?.pieceId === piece.id ? previewMove.to : null;
          const targetPosition = moveTarget ?? piece.position;
          const { x, y } = axialToPixel({ q: targetPosition.q, r: targetPosition.r }, hexSize);
          const isSelected = piece.id === selectedPieceId;
          const arrow = piece.facing === undefined ? null : arrowPoints(piece.facing, hexSize);

          return (
            <g key={piece.id} transform={`translate(${x}, ${y})`}>
              <circle
                r={18}
                className={
                  isSelected
                    ? 'fill-emerald-400/80 stroke-emerald-200'
                    : 'fill-indigo-400/80 stroke-indigo-100'
                }
                strokeWidth="3"
              />
              {arrow && (
                <g className="stroke-slate-950" strokeWidth="2" fill="none">
                  <line x1="0" y1="0" x2={arrow.lineEnd.x} y2={arrow.lineEnd.y} />
                  <polygon points={arrow.head} className="fill-slate-950" />
                </g>
              )}
              <text className="fill-slate-950 font-semibold" textAnchor="middle" dy="5">
                {piece.label ?? 'P'}
              </text>
              <circle
                r={22}
                className="cursor-pointer fill-transparent"
                onClick={() => onSelectPiece?.(piece.id)}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
