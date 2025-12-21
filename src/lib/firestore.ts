import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  arrayUnion,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { GameState, Piece, PlayerState } from '@/types/game';

const gameCollection = db ? collection(db, 'games') : null;

export const defaultPieceForPlayer = (playerId: string, index: number): Piece => ({
  id: `${playerId}-piece`,
  ownerId: playerId,
  position: { q: index, r: -index },
  label: '★',
});

export const createGame = async (hostId: string, hostName: string): Promise<string> => {
  if (!db || !gameCollection) {
    throw new Error('Firebase is not configured');
  }
  const newGame = await addDoc(gameCollection, {
    hostId,
    phase: 'lobby',
    boardRadius: 3,
    turnFrame: 0,
    playerOrder: [hostId],
    pieces: [defaultPieceForPlayer(hostId, 0)],
    createdAt: serverTimestamp(),
  });

  await setDoc(doc(db, 'games', newGame.id, 'players', hostId), {
    id: hostId,
    name: hostName || 'Host',
    color: '#38bdf8',
    isHost: true,
    hand: [],
    joinedAt: serverTimestamp(),
  });

  return newGame.id;
};

export const joinGame = async (gameId: string, player: PlayerState) => {
  if (!db) {
    throw new Error('Firebase is not configured');
  }
  const playerRef = doc(db, 'games', gameId, 'players', player.id);
  await setDoc(playerRef, {
    ...player,
    joinedAt: serverTimestamp(),
  });

  const gameRef = doc(db, 'games', gameId);
  const snapshot = await getDoc(gameRef);
  if (!snapshot.exists()) throw new Error('Game not found');
  const data = snapshot.data();
  const playerOrder: string[] = data.playerOrder ?? [];
  const alreadyJoined = playerOrder.includes(player.id);
  if (!alreadyJoined) {
    await updateDoc(gameRef, {
      playerOrder: arrayUnion(player.id),
      pieces: arrayUnion(defaultPieceForPlayer(player.id, playerOrder.length)),
    });
  }
};

export const startGame = (gameId: string) => {
  if (!db) {
    throw new Error('Firebase is not configured');
  }
  return updateDoc(doc(db, 'games', gameId), { phase: 'playing' });
};

export const listenToGame = (gameId: string, callback: (state: GameState | null) => void): Unsubscribe => {
  if (!db) {
    callback(null);
    return () => {};
  }
  return onSnapshot(doc(db, 'games', gameId), (snap) => {
    if (!snap.exists()) return callback(null);
    const data = snap.data();
    callback({
      id: snap.id,
      hostId: data.hostId,
      phase: data.phase,
      boardRadius: data.boardRadius,
      turnFrame: data.turnFrame,
      playerOrder: data.playerOrder ?? [],
      pieces: data.pieces ?? [],
      createdAt: data.createdAt?.toMillis?.() ?? undefined,
    });
  });
};

export const listenToPlayers = (
  gameId: string,
  callback: (players: PlayerState[]) => void
): Unsubscribe => {
  if (!db) {
    callback([]);
    return () => {};
  }
  return onSnapshot(collection(db, 'games', gameId, 'players'), (snap) => {
    const players: PlayerState[] = snap.docs.map((docSnap) => ({
      ...(docSnap.data() as PlayerState),
      id: docSnap.id,
    }));
    callback(players);
  });
};
