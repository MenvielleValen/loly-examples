/**
 * Types for the virtual office system
 */

export interface Player {
  id: string;
  name: string;
  x: number;
  y: number;
  color?: string; // Color for the player (if not using sprites initially)
  isSitting?: boolean; // Whether the player is sitting
  sittingOn?: string; // ID of the object the player is sitting on
  animation?: string; // Current animation key (e.g., "luis-up", "sofia-idle-down")
}

export interface ChatMessage {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}

export interface OfficeObject {
  id: string;
  type: 'desk' | 'chair' | 'wall' | 'door' | 'plant' | 'other';
  x: number;
  y: number;
  width: number;
  height: number;
  sprite?: string; // Path to sprite image
  interactive?: boolean;
}

export interface PlayerMoveData {
  x: number;
  y: number;
}

export interface PlayerChatData {
  message: string;
}

export interface ObjectInteractData {
  objectId: string;
}

export interface PlayerSitData {
  objectId: string;
  action: 'sit' | 'stand';
}

export interface User {
  id: string;
  name: string;
}

export interface OfficeState {
  players: Map<string, Player>;
  chatMessages: Map<string, ChatMessage>; // playerId -> latest message
  objects: OfficeObject[];
}

