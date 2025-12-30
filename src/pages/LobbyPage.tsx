import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '@/components/PageContainer';
import { useLobbySession } from '@/session/useLobbySession';

export const LobbyPage = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { lobbyState, myPlayer, error, setName } = useLobbySession(gameId);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const players = lobbyState?.players ?? [];
  const canStart = useMemo(() => players.length >= 2 && myPlayer?.role === 'P1', [players.length, myPlayer?.role]);

  const handleCopy = async () => {
    if (!gameId || !navigator.clipboard) return;
    const inviteLink = `${window.location.origin}/lobby/${gameId}`;
    await navigator.clipboard.writeText(inviteLink);
    setCopyStatus('copied');
    window.setTimeout(() => setCopyStatus('idle'), 1500);
  };

  if (!gameId) {
    return (
      <div className="min-h-screen bg-[#0b111e] text-slate-100">
        <PageContainer title="Lobby">
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 shadow-lg backdrop-blur">
            <p className="text-sm text-slate-200">Missing game ID. Create or join a game first.</p>
            <div className="mt-4 flex gap-3">
              <Link
                to="/create"
                className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100"
              >
                Create Game
              </Link>
              <Link
                to="/"
                className="rounded-lg border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-slate-200"
              >
                Back Home
              </Link>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b111e] text-slate-100">
      <PageContainer title="Lobby">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Game ID</p>
                <p className="mt-1 text-xl font-semibold text-white">{gameId}</p>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-xs text-slate-200"
              >
                {copyStatus === 'copied' ? 'Copied' : 'Copy Invite'}
              </button>
            </div>
            {error ? <p className="mt-4 text-xs text-rose-300">{error}</p> : null}
            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Players</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                {players.map((player) => (
                  <li key={player.playerId} className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span>
                        {player.name}{' '}
                        <span className="text-xs text-slate-400">({player.role})</span>
                      </span>
                      <span className="text-xs text-slate-400">
                        {player.status === 'reconnecting'
                          ? 'Reconnecting…'
                          : player.status === 'disconnected'
                          ? 'Disconnected'
                          : player.connected
                          ? 'Connected'
                          : 'Disconnected'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              {players.length < 2 ? (
                <p className="mt-3 text-xs text-slate-400">Waiting for players…</p>
              ) : null}
            </div>
          </section>
          <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 shadow-lg backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Actions</p>
            <label className="mt-4 grid gap-2 text-sm text-slate-200">
              Your Name
              <input
                value={myPlayer?.name ?? ''}
                onChange={(event) => setName(event.target.value)}
                className="rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-slate-100"
              />
            </label>
            <button
              type="button"
              onClick={() => navigate(`/character-select/${gameId}`)}
              disabled={!canStart}
              className={`mt-4 w-full rounded-lg border px-4 py-2 text-sm transition ${
                canStart
                  ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
                  : 'border-white/10 bg-slate-950/50 text-slate-500'
              }`}
            >
              Continue
            </button>
            {!canStart ? (
              <p className="mt-3 text-xs text-slate-500">
                {players.length < 2 ? 'Waiting for opponent…' : 'Only P1 can continue.'}
              </p>
            ) : null}
          </section>
        </div>
      </PageContainer>
    </div>
  );
};
