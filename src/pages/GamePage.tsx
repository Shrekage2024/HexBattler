import { HexBoardPanel } from '@/components/HexBoardPanel';

export const GamePage = () => {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <header className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Hexstrike Prototype
            </p>
            <h1 className="text-2xl font-semibold text-white">
              Game Table
            </h1>
          </div>

          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-200">
            Planning Phase
          </div>
        </header>

        {/* Board */}
        <section className="flex items-center justify-center">
          <HexBoardPanel radius={4} />
        </section>

        {/* Footer placeholder */}
        <footer className="mt-6 text-center text-xs text-slate-400">
          Card execution UI coming next
        </footer>
      </div>
    </main>
  );
};
