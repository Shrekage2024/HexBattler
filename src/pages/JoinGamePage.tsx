import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/PageContainer';

export const JoinGamePage = () => {
  const navigate = useNavigate();
  const [gameInput, setGameInput] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const extractGameId = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return '';
    const withoutQuery = trimmed.split('?')[0] ?? '';
    if (withoutQuery.includes('/')) {
      const parts = withoutQuery.split('/');
      return parts[parts.length - 1] ?? '';
    }
    return withoutQuery;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const gameId = extractGameId(gameInput);
    if (!playerName.trim() || !gameId) {
      setError('Enter a valid invite link or game ID.');
      return;
    }
    window.localStorage.setItem('hexstrike:playerName', playerName.trim());
    navigate(`/lobby/${gameId}`);
  };

  return (
    <div className="min-h-screen bg-[#0b111e] text-slate-100">
      <PageContainer title="Join Game">
        <form
          onSubmit={handleSubmit}
          className="max-w-xl rounded-2xl border border-white/10 bg-slate-900/40 p-6 shadow-lg backdrop-blur"
        >
          <label className="grid gap-2 text-sm text-slate-200">
            Invite Link or Game ID
            <input
              value={gameInput}
              onChange={(event) => setGameInput(event.target.value)}
              className="rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-slate-100"
              placeholder="Paste invite link or enter code"
            />
          </label>
          <label className="mt-4 grid gap-2 text-sm text-slate-200">
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
            className="mt-4 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100"
          >
            Join Game
          </button>
        </form>
      </PageContainer>
    </div>
  );
};
