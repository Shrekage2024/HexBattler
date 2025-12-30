import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';

type LobbyPlayer = {
  playerId: string;
  name: string;
  role: 'P1' | 'P2';
  connected: boolean;
  status: 'connected' | 'reconnecting' | 'disconnected';
  socketId?: string;
  reconnectingUntil?: number;
  characterId?: string;
};

type GameState = {
  gameId: string;
  players: LobbyPlayer[];
  createdAt: number;
};

const app = express();
app.use(express.json());

const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173';
app.use(
  cors({
    origin: clientUrl,
  })
);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: clientUrl,
  },
});

const games = new Map<string, GameState>();
const disconnectTimers = new Map<string, NodeJS.Timeout>();
const RECONNECT_GRACE_MS = 15_000;

const createGameId = () => Math.random().toString(36).slice(2, 8).toUpperCase();

const getInviteUrl = (gameId: string) => `${clientUrl}/lobby/${gameId}`;

const emitLobbyUpdate = (gameId: string) => {
  const game = games.get(gameId);
  if (game) {
    io.to(gameId).emit('lobby:update', game);
  }
};

app.post('/api/games', (_req, res) => {
  let gameId = createGameId();
  while (games.has(gameId)) {
    gameId = createGameId();
  }
  const game: GameState = {
    gameId,
    players: [],
    createdAt: Date.now(),
  };
  games.set(gameId, game);
  res.json({ gameId, inviteUrl: getInviteUrl(gameId) });
});

app.get('/api/games/:gameId', (req, res) => {
  const game = games.get(req.params.gameId);
  if (!game) {
    res.status(404).json({ error: 'Game not found' });
    return;
  }
  res.json(game);
});

io.on('connection', (socket) => {
  socket.on('lobby:join', ({ gameId, playerId, name }: { gameId: string; playerId: string; name?: string }) => {
    const game = games.get(gameId);
    if (!game) {
      socket.emit('lobby:error', { message: 'Game not found' });
      return;
    }
    const existing = game.players.find((player) => player.playerId === playerId);
    if (existing) {
      existing.connected = true;
      existing.status = 'connected';
      existing.socketId = socket.id;
      existing.reconnectingUntil = undefined;
      if (name) existing.name = name;
      const timerKey = `${gameId}:${playerId}`;
      const pending = disconnectTimers.get(timerKey);
      if (pending) {
        clearTimeout(pending);
        disconnectTimers.delete(timerKey);
      }
    } else {
      if (game.players.length >= 2) {
        socket.emit('lobby:error', { message: 'Room full' });
        return;
      }
      const role: LobbyPlayer['role'] = game.players.some((player) => player.role === 'P1') ? 'P2' : 'P1';
      game.players.push({
        playerId,
        name: name ?? 'Player',
        role,
        connected: true,
        status: 'connected',
        socketId: socket.id,
      });
    }
    socket.join(gameId);
    socket.data.gameId = gameId;
    socket.data.playerId = playerId;
    emitLobbyUpdate(gameId);
  });

  socket.on('lobby:setName', ({ gameId, playerId, name }: { gameId: string; playerId: string; name: string }) => {
    const game = games.get(gameId);
    if (!game) return;
    const player = game.players.find((p) => p.playerId === playerId);
    if (!player) return;
    player.name = name;
    emitLobbyUpdate(gameId);
  });

  socket.on(
    'lobby:setCharacter',
    ({ gameId, playerId, characterId }: { gameId: string; playerId: string; characterId: string }) => {
      const game = games.get(gameId);
      if (!game) return;
      const player = game.players.find((p) => p.playerId === playerId);
      if (!player) return;
      player.characterId = characterId;
      emitLobbyUpdate(gameId);
    }
  );

  socket.on('disconnect', () => {
    const gameId = socket.data.gameId as string | undefined;
    const playerId = socket.data.playerId as string | undefined;
    if (!gameId || !playerId) return;
    const game = games.get(gameId);
    if (!game) return;
    const player = game.players.find((p) => p.playerId === playerId);
    if (!player) return;
    if (player.socketId && player.socketId !== socket.id) return;
    player.status = 'reconnecting';
    player.reconnectingUntil = Date.now() + RECONNECT_GRACE_MS;
    emitLobbyUpdate(gameId);
    const timerKey = `${gameId}:${playerId}`;
    const existingTimer = disconnectTimers.get(timerKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    const timeout = setTimeout(() => {
      const currentGame = games.get(gameId);
      const currentPlayer = currentGame?.players.find((p) => p.playerId === playerId);
      if (!currentPlayer) return;
      if (currentPlayer.socketId !== socket.id) return;
      if (currentPlayer.status !== 'reconnecting') return;
      currentPlayer.connected = false;
      currentPlayer.status = 'disconnected';
      currentPlayer.reconnectingUntil = undefined;
      emitLobbyUpdate(gameId);
      disconnectTimers.delete(timerKey);
    }, RECONNECT_GRACE_MS);
    disconnectTimers.set(timerKey, timeout);
  });
});

const port = process.env.PORT ? Number(process.env.PORT) : 3001;
server.listen(port, () => {
  console.log(`Lobby server running on http://localhost:${port}`);
});
