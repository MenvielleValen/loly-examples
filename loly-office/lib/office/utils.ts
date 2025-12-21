/**
 * Utility functions for the virtual office system
 */

import type { Player, OfficeObject } from './types';
import { PLAYER_WIDTH, PLAYER_HEIGHT } from './constants';

/**
 * Check if a point (x, y) collides with a rectangle
 */
export function pointInRect(
  px: number,
  py: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

/**
 * Check if two rectangles collide
 */
export function rectCollision(
  x1: number,
  y1: number,
  w1: number,
  h1: number,
  x2: number,
  y2: number,
  w2: number,
  h2: number
): boolean {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

/**
 * Check if a player would collide with any office object at the given position
 */
export function checkPlayerCollision(
  playerX: number,
  playerY: number,
  objects: OfficeObject[],
  excludeObjectId?: string
): boolean {
  for (const obj of objects) {
    if (excludeObjectId && obj.id === excludeObjectId) continue;
    // Check collisions with all objects (walls, desks, chairs, etc.)
    // All objects are solid for collision purposes
    
    if (
      rectCollision(
        playerX,
        playerY,
        PLAYER_WIDTH,
        PLAYER_HEIGHT,
        obj.x,
        obj.y,
        obj.width,
        obj.height
      )
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Load an image and return a Promise
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Load multiple images
 */
export function loadImages(
  paths: Record<string, string>
): Promise<Map<string, HTMLImageElement>> {
  const promises = Object.entries(paths).map(async ([key, path]) => {
    try {
      const img = await loadImage(path);
      return [key, img] as [string, HTMLImageElement];
    } catch (error) {
      console.warn(`Failed to load image: ${path}`, error);
      return null;
    }
  });

  return Promise.all(promises).then((results) => {
    const map = new Map<string, HTMLImageElement>();
    results.forEach((result) => {
      if (result) {
        map.set(result[0], result[1]);
      }
    });
    return map;
  });
}

/**
 * Calculate distance between two points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * Find the nearest interactive object to a position
 */
export function findNearestInteractiveObject(
  px: number,
  py: number,
  objects: OfficeObject[],
  maxDistance: number = 80
): OfficeObject | null {
  let nearest: OfficeObject | null = null;
  let minDistance = maxDistance;

  for (const obj of objects) {
    if (!obj.interactive || obj.type !== 'chair') continue;

    // Calculate distance to object center
    const objCenterX = obj.x + obj.width / 2;
    const objCenterY = obj.y + obj.height / 2;
    const dist = distance(px, py, objCenterX, objCenterY);

    if (dist < minDistance) {
      minDistance = dist;
      nearest = obj;
    }
  }

  return nearest;
}

