import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '@/components/PageContainer';
import { useLobbySession } from '@/session/useLobbySession';

const characterOptions = [
  { id: 'char-01', name: 'Vanguard' },
  { id: 'char-02', name: 'Seer' },
  { id: 'char-03', name: 'Warden' },
  { id: 'char-04', name: 'Striker' },
  { id: 'char-05', name: 'Sentinel' },
  { id: 'char-06', name: 'Shade' },
  { id: 'char-07', name: 'Nomad' },
  { id: 'char-08', name: 'Oracle' },
];

export const CharacterSelectPage = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { lobbyState, myPlayer, setCharacter } = useLobbySession(gameId);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const players = lobbyState?.players ?? [];
  const allReady = players.length >= 2 && players.every((player) => Boolean(player.characterId));

  if (!gameId || !myPlayer) {
    return (
      <div className="min-h-screen bg-[#0b111e] text-slate-100">
        <PageContainer title="Character Select">
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 shadow-lg backdrop-blur">
            <p className="text-sm text-slate-200">No active session. Return to the lobby first.</p>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b111e] text-slate-100">
      <PageContainer title="Choose Character">
        <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 shadow-lg backdrop-blur">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {characterOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setSelectedId(option.id);
                  setCharacter(option.id);
                }}
                className={`rounded-xl border p-4 text-left transition ${
                  selectedId === option.id
                    ? 'border-emerald-400/60 bg-emerald-500/10'
                    : 'border-white/10 bg-slate-950/60 hover:border-emerald-300/40'
                }`}
              >
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{option.id}</p>
                <p className="mt-2 text-base font-semibold text-white">{option.name}</p>
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-white/10 bg-slate-950/60 p-3">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Ready Status</p>
            <div className="mt-3 space-y-2 text-sm text-slate-200">
              {players.length === 0 ? (
                <p className="text-xs text-slate-500">Waiting for players…</p>
              ) : (
                players.map((player) => (
                  <div key={player.playerId} className="flex items-center justify-between">
                    <span>
                      {player.name}{' '}
                      <span className="text-xs text-slate-400">({player.role})</span>
                    </span>
                    <span className="text-xs text-slate-400">
                      {player.characterId ? 'Ready' : 'Selecting…'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              {selectedId ? `Selected: ${selectedId}` : 'Select a character to continue.'}
            </p>
            <button
              type="button"
              onClick={() => navigate(`/table?gameId=${gameId}`)}
              disabled={!selectedId || !allReady}
              className={`rounded-lg border px-4 py-2 text-sm transition ${
                selectedId && allReady
                  ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
                  : 'border-white/10 bg-slate-950/50 text-slate-500'
              }`}
            >
              Continue to Table
            </button>
          </div>
          {!allReady ? <p className="mt-2 text-xs text-slate-500">Both players must select a character.</p> : null}
        </section>
      </PageContainer>
    </div>
  );
};
