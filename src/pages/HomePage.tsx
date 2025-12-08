import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { PageContainer } from '@/components/PageContainer';
import { useAnonymousAuth } from '@/hooks/useAnonymousAuth';
import { createGame } from '@/lib/firestore';
import { db } from '@/lib/firebase';
import type { GameState } from '@/types/game';

export const HomePage = () => {
  const { user, loading } = useAnonymousAuth();
  const [displayName, setDisplayName] = useState('');
  const [games, setGames] = useState<GameState[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'games'), where('playerOrder', 'array-contains', user.uid));
    return onSnapshot(q, (snapshot) => {
      const nextGames: GameState[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        hostId: doc.data().hostId,
        phase: doc.data().phase,
        boardRadius: doc.data().boardRadius,
        turnFrame: doc.data().turnFrame,
        playerOrder: doc.data().playerOrder ?? [],
        pieces: doc.data().pieces ?? [],
        createdAt: doc.data().createdAt?.toMillis?.(),
      }));
      setGames(nextGames);
    });
  }, [user]);

  const sortedGames = useMemo(() => games.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)), [games]);

  const handleCreateGame = async () => {
    if (!user) return;
    const gameId = await createGame(user.uid, displayName || 'Player');
    navigate(`/game/${gameId}`);
  };

  return (
    <PageContainer
      title="Welcome"
      actions={
        <button
          type="button"
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-500/20"
          onClick={handleCreateGame}
          disabled={loading || !user}
        >
          Create Game
        </button>
      }
    >
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold text-white">Create or Resume</h2>
          <p className="mt-2 text-sm text-slate-400">
            Spin up a lobby, invite friends with a shareable link, and jump back into your active boards.
          </p>
          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium text-slate-300">
              Display name
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Commander"
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
              />
            </label>
            <button
              type="button"
              className="w-full rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-slate-50 shadow-md shadow-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleCreateGame}
              disabled={loading || !user}
            >
              {loading ? 'Connecting…' : 'Create Game & Invite'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold text-white">Your active games</h2>
          {games.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">No games yet. Spin one up to generate an invite link.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {sortedGames.map((game) => (
                <li key={game.id} className="rounded-lg border border-slate-800/80 bg-slate-800/60 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">Game {game.id.slice(0, 6)}</p>
                      <p className="text-xs text-slate-400">Phase: {game.phase}</p>
                    </div>
                    <button
                      type="button"
                      className="text-sm font-semibold text-emerald-300 hover:text-emerald-200"
                      onClick={() => navigate(`/game/${game.id}`)}
                    >
                      Open
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </PageContainer>
  );
};
