import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Unsubscribe } from 'firebase/firestore';
import { HexBoard } from '@/components/HexBoard';
import { PageContainer } from '@/components/PageContainer';
import { useAnonymousAuth } from '@/hooks/useAnonymousAuth';
import { joinGame, listenToGame, listenToPlayers, startGame } from '@/lib/firestore';
import type { AxialCoord, GameState, PlayerState } from '@/types/game';
import {
  applyMove,
  demoAdvanceCard,
  directionLabels,
  getLegalActions,
  type Direction,
  type EnginePiece,
} from '@/engine';

const colors = ['#38bdf8', '#f472b6', '#c084fc', '#f59e0b'];

export const GamePage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAnonymousAuth();
  const [game, setGame] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const navigate = useNavigate();
  const boardRadius = game?.boardRadius ?? 3;

  const [piece, setPiece] = useState<EnginePiece>({
    id: 'demo-piece',
    position: { q: 0, r: 0 },
    facing: 0,
  });
  const [planningCardId, setPlanningCardId] = useState<string | null>(null);
  const [chosenFacing, setChosenFacing] = useState<Direction | null>(null);

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

  const planningActions = useMemo(
    () =>
      getLegalActions({
        piece,
        card: demoAdvanceCard,
        boardRadius,
        chosenFacing: chosenFacing ?? undefined,
      }),
    [boardRadius, chosenFacing, piece]
  );

  const beginPlanning = () => {
    setPlanningCardId(demoAdvanceCard.id);
    setChosenFacing(null);
  };

  const handleSelectFacing = (direction: Direction) => {
    setChosenFacing(direction);
  };

  const handleApplyMove = (destination: AxialCoord) => {
    if (chosenFacing === null) return;
    setPiece((current) =>
      applyMove({
        piece: current,
        destination,
        facing: chosenFacing,
      })
    );
    setPlanningCardId(null);
    setChosenFacing(null);
  };

  const isPlanning = planningCardId === demoAdvanceCard.id;
  const destinationOptions = isPlanning && chosenFacing !== null ? planningActions.moveDestinations : [];
  const showFacingOptions = isPlanning && chosenFacing === null;

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
      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          {game?.phase === 'lobby' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
              Waiting for players… the local demo board below stays interactive.
            </div>
          )}
          <HexBoard
            radius={boardRadius}
            pieces={[{ id: piece.id, ownerId: 'local', position: piece.position, label: 'A', facing: piece.facing }]}
            selectedPieceId={piece.id}
            highlightedHexes={destinationOptions}
            onHexClick={handleApplyMove}
          />

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Card Tray</p>
                <p className="text-xs text-slate-400">Select a card to plan a move.</p>
              </div>
              <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] uppercase text-slate-300">Demo</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className={
                  isPlanning
                    ? 'rounded-xl border border-emerald-400 bg-emerald-500/20 px-4 py-3 text-left text-sm font-semibold text-emerald-200'
                    : 'rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-left text-sm font-semibold text-slate-100'
                }
                onClick={beginPlanning}
              >
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Move</div>
                <div className="text-lg text-white">Advance</div>
                <div className="mt-2 text-xs text-slate-400">Move F 2 · Rotate ±1</div>
              </button>
            </div>
            {showFacingOptions && (
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Choose facing</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {planningActions.facingOptions.map((direction) => (
                    <button
                      key={direction}
                      type="button"
                      onClick={() => handleSelectFacing(direction)}
                      className="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs font-semibold text-slate-100"
                    >
                      {directionLabels[direction]}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {isPlanning && chosenFacing !== null && (
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <p className="text-xs text-slate-400">
                  Click a highlighted hex to move. Facing:{' '}
                  <span className="text-emerald-300">{directionLabels[chosenFacing]}</span>
                </p>
              </div>
            )}
          </section>
        </div>

        <aside className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Lobby</h2>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
              {game?.phase ?? 'local'}
            </span>
          </div>
          {game ? (
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
          ) : (
            <p className="mt-4 text-sm text-slate-400">Local demo mode: Firebase data is unavailable.</p>
          )}
          <div className="mt-4 text-xs text-slate-400">
            Invite link: <span className="text-emerald-300">{inviteLink}</span>
          </div>
        </aside>
      </div>
    </PageContainer>
  );

  function handleStartGame() {
    if (gameId) startGame(gameId);
  }
};
