import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Unsubscribe } from 'firebase/firestore';
import { HexBoard } from '@/components/HexBoard';
import { PageContainer } from '@/components/PageContainer';
import { useAnonymousAuth } from '@/hooks/useAnonymousAuth';
import { joinGame, listenToGame, listenToPlayers, startGame } from '@/lib/firestore';
import type { GameState, LocalMovePreview, PlayerState } from '@/types/game';

const colors = ['#38bdf8', '#f472b6', '#c084fc', '#f59e0b'];

export const GamePage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAnonymousAuth();
  const [game, setGame] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [selectedPieceId, setSelectedPieceId] = useState<string | undefined>();
  const [preview, setPreview] = useState<LocalMovePreview | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!gameId || !user) return;
    const player: PlayerState = {
      id: user.uid,
      name: user.displayName || 'Player',
      color: colors[user.uid.charCodeAt(0) % colors.length],
      isHost: false,
      hand: [],
    };
    joinGame(gameId, player).catch((error) => console.error('joinGame failed', error));
  }, [gameId, user]);

  useEffect(() => {
    if (!gameId) return;
    const unsubscribers: Unsubscribe[] = [];
    unsubscribers.push(
      listenToGame(gameId, (state) => {
        setGame(state);
      })
    );
    unsubscribers.push(listenToPlayers(gameId, setPlayers));
    return () => unsubscribers.forEach((u) => u());
  }, [gameId]);

  const inviteLink = useMemo(() => (gameId ? `${window.location.origin}/game/${gameId}` : ''), [gameId]);
  const currentPlayerPiece = useMemo(
    () => game?.pieces.find((piece) => piece.ownerId === user?.uid),
    [game?.pieces, user?.uid]
  );

  const handleSelect = (pieceId: string) => {
    setSelectedPieceId(pieceId);
    const piece = game?.pieces.find((p) => p.id === pieceId);
    if (!piece) return;
    const next: LocalMovePreview = {
      pieceId,
      from: piece.position,
      to: { q: piece.position.q + 1, r: piece.position.r },
    };
    setPreview(next);
  };

  const handleStartGame = () => {
    if (gameId) startGame(gameId);
  };

  if (!gameId) return null;

  return (
    <PageContainer
      title={`Game ${gameId.slice(0, 6)}`}
      actions={
        <div className="flex gap-3">
          <button
            type="button"
            className="rounded-md border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200"
            onClick={() => navigator.clipboard?.writeText(inviteLink)}
          >
            Copy Invite Link
          </button>
          {game?.phase === 'lobby' && game.hostId === user?.uid && (
            <button
              type="button"
              onClick={handleStartGame}
              className="rounded-md bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-900 shadow-emerald-500/20"
            >
              Start Game
            </button>
          )}
        </div>
      }
    >
      {game ? (
        <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            {game.phase === 'lobby' ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                <p className="text-sm text-slate-300">Waiting for players… share the link to invite others.</p>
              </div>
            ) : (
              <HexBoard
                radius={game.boardRadius}
                pieces={game.pieces}
                selectedPieceId={selectedPieceId ?? currentPlayerPiece?.id}
                onSelectPiece={handleSelect}
                previewMove={preview}
              />
            )}
          </div>

          <aside className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Lobby</h2>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{game.phase}</span>
            </div>
            <ul className="mt-4 space-y-3">
              {players.map((player) => (
                <li
                  key={player.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-800/60 px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ background: player.color }} />
                    <div>
                      <p className="text-sm font-semibold text-white">{player.name || 'Player'}</p>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                        {player.isHost ? 'Host' : 'Guest'}
                      </p>
                    </div>
                  </div>
                  {player.id === user?.uid && game.phase === 'playing' && (
                    <button
                      type="button"
                      className="text-xs font-semibold text-emerald-300"
                      onClick={() => navigate(`/game/${gameId}`)}
                    >
                      Recenter
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-4 text-xs text-slate-400">
              Invite link: <span className="text-emerald-300">{inviteLink}</span>
            </div>
          </aside>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-slate-300">
          Loading game data…
        </div>
      )}
    </PageContainer>
  );
};
