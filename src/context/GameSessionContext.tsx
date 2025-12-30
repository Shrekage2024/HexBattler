import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type Player = {
  id: string;
  name: string;
  characterId?: string;
};

export type GameSession = {
  gameId: string;
  players: Player[];
  localPlayerId: string;
};

type GameSessionContextValue = {
  session: GameSession | null;
  createGame: (playerName: string) => GameSession;
  joinGame: (gameId: string, playerName: string) => GameSession;
  setCharacter: (playerId: string, characterId: string) => void;
  resetSession: () => void;
};

const GameSessionContext = createContext<GameSessionContextValue | undefined>(undefined);

const createGameId = () => Math.random().toString(36).slice(2, 8).toUpperCase();

const upsertPlayer = (players: Player[], nextPlayer: Player) => {
  const existingIndex = players.findIndex((player) => player.id === nextPlayer.id);
  if (existingIndex === -1) return [...players, nextPlayer];
  const next = [...players];
  next[existingIndex] = nextPlayer;
  return next;
};

export const GameSessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<GameSession | null>(null);

  const createGame = (playerName: string) => {
    const gameId = createGameId();
    const localPlayerId = 'P1';
    const nextSession: GameSession = {
      gameId,
      localPlayerId,
      players: [{ id: localPlayerId, name: playerName }],
    };
    setSession(nextSession);
    return nextSession;
  };

  const joinGame = (gameId: string, playerName: string) => {
    const localPlayerId = session?.localPlayerId ?? 'P2';
    const playerId = localPlayerId === 'P1' ? 'P2' : localPlayerId;
    const nextSession: GameSession = {
      gameId,
      localPlayerId: playerId,
      players: upsertPlayer(session?.players ?? [], { id: playerId, name: playerName }),
    };
    setSession(nextSession);
    return nextSession;
  };

  const setCharacter = (playerId: string, characterId: string) => {
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        players: prev.players.map((player) =>
          player.id === playerId ? { ...player, characterId } : player
        ),
      };
    });
  };

  const resetSession = () => setSession(null);

  return (
    <GameSessionContext.Provider
      value={{
        session,
        createGame,
        joinGame,
        setCharacter,
        resetSession,
      }}
    >
      {children}
    </GameSessionContext.Provider>
  );
};

export const useGameSession = () => {
  const context = useContext(GameSessionContext);
  if (!context) {
    throw new Error('useGameSession must be used within a GameSessionProvider');
  }
  return context;
};
