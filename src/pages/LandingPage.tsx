import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/PageContainer';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0b111e] text-slate-100">
      <PageContainer
        title="HexStrike"
        actions={
          <div className="flex gap-3">
            <Link
              to="/create"
              className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100"
            >
              Create Game
            </Link>
            <Link
              to="/join"
              className="rounded-lg border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-slate-200"
            >
              Join Game
            </Link>
          </div>
        }
      >
        <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 shadow-lg backdrop-blur">
          <p className="text-sm text-slate-300">
            Plan your program, commit your cards, and resolve the round frame by frame.
          </p>
        </section>
      </PageContainer>
    </div>
  );
};
