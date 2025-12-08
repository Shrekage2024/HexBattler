import { useMemo } from 'react';
import type { AxialCoord, Piece } from '@/types/game';

interface HexBoardProps {
  radius: number;
  pieces: Piece[];
  selectedPieceId?: string;
  onSelectPiece?: (id: string) => void;
  previewMove?: { pieceId: string; to: AxialCoord } | null;
}

const axialToPixel = (q: number, r: number, size = 36) => {
  const x = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
  const y = size * ((3 / 2) * r);
  return { x, y };
};

const buildHexes = (radius: number) => {
  const hexes: AxialCoord[] = [];
  for (let q = -radius; q <= radius; q += 1) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r += 1) {
      hexes.push({ q, r });
    }
  }
  return hexes;
};

export const HexBoard = ({ radius, pieces, selectedPieceId, onSelectPiece, previewMove }: HexBoardProps) => {
  const hexes = useMemo(() => buildHexes(radius), [radius]);
  const size = 36;

  return (
    <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
      <svg viewBox="-240 -200 480 400" className="w-full">
        {hexes.map(({ q, r }) => {
          const { x, y } = axialToPixel(q, r, size * 0.6);
          return (
            <g key={`${q},${r}`} transform={`translate(${x}, ${y})`}>
              <polygon
                points="32,0 16,27.7 -16,27.7 -32,0 -16,-27.7 16,-27.7"
                className="fill-slate-800 stroke-slate-700"
                strokeWidth="1.5"
              />
              <text className="fill-slate-500 text-[10px]" textAnchor="middle" dy="4">
                {q},{r}
              </text>
            </g>
          );
        })}

        {pieces.map((piece) => {
          const moveTarget = previewMove?.pieceId === piece.id ? previewMove.to : null;
          const targetPosition = moveTarget ?? piece.position;
          const { x, y } = axialToPixel(targetPosition.q, targetPosition.r, size * 0.6);
          const isSelected = piece.id === selectedPieceId;

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
