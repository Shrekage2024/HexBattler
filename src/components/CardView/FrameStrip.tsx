import type { Frame } from '@/cards/types';
import { SymbolIcon } from './SymbolIcon';

interface FrameStripProps {
  frames: Frame[];
}

export const FrameStrip = ({ frames }: FrameStripProps) => {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {frames.map((frame, index) => (
        <div
          key={frame.id}
          className="min-w-[92px] rounded-xl border border-white/10 bg-slate-950/60 p-2"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Frame {index + 1}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {frame.symbols.map((symbol, symbolIndex) => (
              <div
                key={`${frame.id}-${symbol.id}-${symbolIndex}`}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-slate-900/70"
              >
                <SymbolIcon symbol={symbol} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
