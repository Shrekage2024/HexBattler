import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/PageContainer';

export const CreateGamePage = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!playerName.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await window.fetch(`${import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001'}/api/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Failed to create game');
      }
      const data = (await response.json()) as { gameId: string };
      window.localStorage.setItem('hexstrike:playerName', playerName.trim());
      navigate(`/lobby/${data.gameId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create game');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b111e] text-slate-100">
      <PageContainer title="Create Game">
        <form
          onSubmit={handleSubmit}
          className="max-w-xl rounded-2xl border border-white/10 bg-slate-900/40 p-6 shadow-lg backdrop-blur"
        >
          <label className="grid gap-2 text-sm text-slate-200">
            Player Name
            <input
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              className="rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-slate-100"
              placeholder="Enter your name"
            />
          </label>
          {error ? <p className="mt-3 text-xs text-rose-300">{error}</p> : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`mt-4 rounded-lg border px-4 py-2 text-sm transition ${
              isSubmitting
                ? 'border-white/10 bg-slate-950/50 text-slate-500'
                : 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
            }`}
          >
            {isSubmitting ? 'Creating…' : 'Create Game'}
          </button>
        </form>
      </PageContainer>
    </div>
  );
};
