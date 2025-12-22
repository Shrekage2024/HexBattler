interface CardBackProps {
  size?: 'compact' | 'full';
}

export const CardBack = ({ size = 'full' }: CardBackProps) => {
  return (
    <div
      className={`relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 shadow-lg ${
        size === 'compact' ? 'w-40' : 'w-72'
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(45,212,191,0.15),transparent_45%)]" />
      <div className="absolute inset-4 rounded-xl border border-white/10" />
      <div className="relative flex h-full items-center justify-center text-xs uppercase tracking-[0.4em] text-slate-300">
        HexStrike
      </div>
    </div>
  );
};
