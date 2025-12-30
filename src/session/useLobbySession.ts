import { useEffect, useMemo, useState } from 'react';
import { getSocket } from '@/net/socket';

export type LobbyPlayer = {
  playerId: string;
  name: string;
  role: 'P1' | 'P2';
  connected: boolean;
  status?: 'connected' | 'reconnecting' | 'disconnected';
  reconnectingUntil?: number;
  characterId?: string;
};

export type LobbyState = {
  gameId: string;
  players: LobbyPlayer[];
  createdAt: number;
};

const PLAYER_ID_KEY = 'hexstrike:playerId';
const PLAYER_NAME_KEY = 'hexstrike:playerName';

const createPlayerId = () => {
  if (typeof window !== 'undefined' && window.crypto && 'randomUUID' in window.crypto) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 14);
};

const getStoredPlayerId = () => {
  const stored = window.localStorage.getItem(PLAYER_ID_KEY);
  if (stored) return stored;
  const next = createPlayerId();
  window.localStorage.setItem(PLAYER_ID_KEY, next);
  return next;
};

export const useLobbySession = (gameId: string | undefined) => {
  const socket = useMemo(() => getSocket(), []);
  const playerId = useMemo(() => getStoredPlayerId(), []);
  const [lobbyState, setLobbyState] = useState<LobbyState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);
    const handleUpdate = (state: LobbyState) => {
      setLobbyState(state);
      setError(null);
    };
    const handleError = (payload: { message?: string }) => {
      setError(payload?.message ?? 'Lobby error');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('lobby:update', handleUpdate);
    socket.on('lobby:error', handleError);
    socket.connect();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('lobby:update', handleUpdate);
      socket.off('lobby:error', handleError);
    };
  }, [socket]);

  useEffect(() => {
    if (!gameId) return;
    const name = window.localStorage.getItem(PLAYER_NAME_KEY) ?? undefined;
    const join = () => {
      socket.emit('lobby:join', { gameId, playerId, name });
    };
    if (socket.connected) {
      join();
      return;
    }
    const onConnect = () => join();
    socket.once('connect', onConnect);
    return () => {
      socket.off('connect', onConnect);
    };
  }, [socket, gameId, playerId]);

  const setName = (name: string) => {
    if (!gameId) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    window.localStorage.setItem(PLAYER_NAME_KEY, trimmed);
    socket.emit('lobby:setName', { gameId, playerId, name: trimmed });
  };

  const setCharacter = (characterId: string) => {
    if (!gameId) return;
    socket.emit('lobby:setCharacter', { gameId, playerId, characterId });
  };

  const myPlayer = useMemo(
    () => lobbyState?.players.find((player) => player.playerId === playerId) ?? null,
    [lobbyState, playerId]
  );

  return {
    lobbyState,
    myPlayer,
    playerId,
    connected,
    error,
    setName,
    setCharacter,
  };
};
