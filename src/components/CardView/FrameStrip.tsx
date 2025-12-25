import type { Frame } from '@/cards/types';
import { normalizeFrames } from '@/cards/normalizeFrames';
import { SymbolIcon } from './SymbolIcon';

interface FrameStripProps {
  frames: Frame[];
  selectedIndex?: number | null;
  onSelectFrame?: (index: number) => void;
}

export const FrameStrip = ({ frames, selectedIndex, onSelectFrame }: FrameStripProps) => {
  const orderedFrames = normalizeFrames(frames);
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {orderedFrames.map((frame) => (
        <div
          key={`frame-${frame.index}`}
          className={`min-w-[92px] rounded-xl border p-2 transition ${
            frame.index === selectedIndex
              ? 'border-emerald-400/60 bg-emerald-500/10'
              : 'border-white/10 bg-slate-950/60'
          }`}
          role={onSelectFrame ? 'button' : undefined}
          tabIndex={onSelectFrame ? 0 : undefined}
          onClick={onSelectFrame ? () => onSelectFrame(frame.index) : undefined}
          onKeyDown={
            onSelectFrame
              ? (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelectFrame(frame.index);
                  }
                }
              : undefined
          }
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Frame {frame.index}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {frame.symbols.map((symbol, symbolIndex) => (
              <div
                key={`symbol-${frame.index}-${symbolIndex}`}
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
