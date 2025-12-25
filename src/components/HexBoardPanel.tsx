import { useMemo, useState } from 'react';
import type { Axial } from '@/lib/geometry';
import { makeHexagonDisk } from '@/lib/geometry';
import { HexBoard } from './HexBoard';

interface HexBoardPanelProps {
  radius?: number;
  highlightedCells?: Set<string>;
  onSelectedCellChange?: (cell: Axial | null) => void;
}

const axialDistance = (a: Axial, b: Axial) => {
  const dq = a.q - b.q;
  const dr = a.r - b.r;
  const ds = -a.q - a.r - (-b.q - b.r);
  return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(ds));
};

export const HexBoardPanel = ({ radius = 3, highlightedCells, onSelectedCellChange }: HexBoardPanelProps) => {
  const [selectedCell, setSelectedCell] = useState<Axial | null>(null);

  const hexes = useMemo(() => makeHexagonDisk(radius), [radius]);

  // Make center stable so useMemo deps are correct (prevents react-hooks/exhaustive-deps warning)
  const center = useMemo<Axial>(() => ({ q: 0, r: 0 }), []);

  const coreCells = useMemo(() => {
    return hexes.filter((cell) => axialDistance(cell, center) <= 1);
  }, [hexes, center]);

  const handleSelectCell = (cell: Axial) => {
    setSelectedCell(cell);
    onSelectedCellChange?.(cell);
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-4 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Arena</p>
          <h2 className="text-xl font-semibold text-white">Hex map</h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-slate-200">
          Radius {radius}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-center">
        <HexBoard
          radius={radius}
          pieces={[]}
          className="w-full max-w-3xl border-0 bg-transparent p-0 shadow-none"
          highlightedHexes={coreCells}
          selectedCell={selectedCell}
          highlightedCells={highlightedCells}
          onCellClick={handleSelectCell}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(45,212,191,0.08),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(52,211,153,0.12),transparent_55%)]" />
    </section>
  );
};
