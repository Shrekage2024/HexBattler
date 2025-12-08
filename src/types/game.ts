export type Phase = 'lobby' | 'playing' | 'complete';

export interface AxialCoord {
  q: number;
  r: number;
}

export interface Piece {
  id: string;
  ownerId: string;
  position: AxialCoord;
  label?: string;
}

export interface GameState {
  id: string;
  hostId: string;
  phase: Phase;
  boardRadius: number;
  turnFrame: number;
  playerOrder: string[];
  pieces: Piece[];
  createdAt?: number;
}

export interface PlayerState {
  id: string;
  name: string;
  color: string;
  isHost: boolean;
  hand: string[];
  joinedAt?: number;
}

export interface LobbyPresence extends PlayerState {
  isConnected: boolean;
}

export interface LocalMovePreview {
  pieceId: string;
  from: AxialCoord;
  to: AxialCoord;
}
