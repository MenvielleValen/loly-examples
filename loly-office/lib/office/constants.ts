/**
 * Constants for the virtual office system
 */

import type { OfficeObject } from './types';

// Canvas dimensions
export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 800;

// Player movement
export const PLAYER_SPEED = 5; // pixels per frame
// Player sprite actual size: 43x113, but we scale it down for better visual balance
export const PLAYER_VISUAL_SCALE = 0.65; // Scale factor to make player size more reasonable
export const PLAYER_WIDTH = Math.round(43 * PLAYER_VISUAL_SCALE); // ~28px visual width
export const PLAYER_HEIGHT = Math.round(113 * PLAYER_VISUAL_SCALE); // ~73px visual height
export const PLAYER_SIZE = PLAYER_WIDTH; // Default size reference (using width)

// Movement throttling (send position update every N ms)
export const MOVEMENT_UPDATE_INTERVAL = 100; // ms (balanced for smooth movement without excessive updates)

// Chat settings
export const CHAT_BUBBLE_DURATION = 5000; // 5 seconds
export const CHAT_MAX_LENGTH = 100; // Maximum characters per message

// Office layout dimensions
export const OFFICE_WIDTH = 2000;
export const OFFICE_HEIGHT = 1500;

// Default office objects (can be expanded)
export const DEFAULT_OFFICE_OBJECTS: OfficeObject[] = [
  // Walls
  { id: 'wall-north', type: 'wall', x: 0, y: 0, width: OFFICE_WIDTH, height: 20, interactive: false },
  { id: 'wall-south', type: 'wall', x: 0, y: OFFICE_HEIGHT - 20, width: OFFICE_WIDTH, height: 20, interactive: false },
  { id: 'wall-west', type: 'wall', x: 0, y: 0, width: 20, height: OFFICE_HEIGHT, interactive: false },
  { id: 'wall-east', type: 'wall', x: OFFICE_WIDTH - 20, y: 0, width: 20, height: OFFICE_HEIGHT, interactive: false },
  
  // Desks (visual size - sprites are 69x43 but we render them larger)
  { id: 'desk-1', type: 'desk', x: 200, y: 200, width: 120, height: 80, interactive: true },
  { id: 'desk-2', type: 'desk', x: 400, y: 200, width: 120, height: 80, interactive: true },
  { id: 'desk-3', type: 'desk', x: 200, y: 400, width: 120, height: 80, interactive: true },
  { id: 'desk-4', type: 'desk', x: 400, y: 400, width: 120, height: 80, interactive: true },
  
  // Chairs (visual size - sprites are 16x26 but we render them larger)
  { id: 'chair-1', type: 'chair', x: 220, y: 280, width: 48, height: 64, interactive: true },
  { id: 'chair-2', type: 'chair', x: 420, y: 280, width: 48, height: 64, interactive: true },
  { id: 'chair-3', type: 'chair', x: 220, y: 480, width: 48, height: 64, interactive: true },
  { id: 'chair-4', type: 'chair', x: 420, y: 480, width: 48, height: 64, interactive: true },
  
  // More furniture
  { id: 'desk-5', type: 'desk', x: 800, y: 300, width: 120, height: 80, interactive: true },
  { id: 'desk-6', type: 'desk', x: 1000, y: 300, width: 120, height: 80, interactive: true },
  { id: 'chair-5', type: 'chair', x: 820, y: 380, width: 48, height: 64, interactive: true },
  { id: 'chair-6', type: 'chair', x: 1020, y: 380, width: 48, height: 64, interactive: true },
];

// Sprite paths (will be in public/sprites/)
export const SPRITE_PATHS = {
  player: '/sprites/characters/player-idle.png',
  playerWalk: '/sprites/characters/player-walk.png',
  floor: '/sprites/office/floor.png',
  wall: '/sprites/office/wall.png',
  desk: '/sprites/office/desk.png',
  chair: '/sprites/office/chair.png',
} as const;

// Generate colors for players based on their ID
export function getPlayerColor(playerId: string): string {
  // Simple hash function to generate consistent colors
  let hash = 0;
  for (let i = 0; i < playerId.length; i++) {
    hash = playerId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 50%)`;
}

