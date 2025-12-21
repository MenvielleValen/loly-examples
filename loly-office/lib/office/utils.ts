/**
 * Utility functions for the virtual office system
 */

import type { OfficeObject } from './types';

/**
 * Calculate distance between two points
 */
function distance(x1: number, y1: number, x2: number, y2: number): number {
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

