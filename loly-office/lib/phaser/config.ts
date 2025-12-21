// Only import Phaser types at module level, actual Phaser import will be dynamic
import type { Types } from "phaser";

/**
 * Phaser game configuration
 * Note: Phaser itself is imported dynamically to avoid SSR issues
 */
export const getPhaserConfig = async (): Promise<Types.Core.GameConfig> => {
  // Dynamic import to avoid SSR issues
  const Phaser = await import("phaser");
  
  // Get container dimensions
  const container = document.getElementById("phaser-container");
  const width = container?.clientWidth || window.innerWidth || 1200;
  const height = container?.clientHeight || window.innerHeight || 800;
  
  return {
    type: Phaser.AUTO,
    width: width,
    height: height,
    parent: "phaser-container",
    backgroundColor: "#e8e8e8",
    physics: {
      default: "matter",
      matter: {
        gravity: { y: 0, x: 0 },
        debug: false,
        enableSleeping: false, // Mantiene todos los cuerpos activos todo el tiempo
      },
    },
    scene: [], // Scenes will be added dynamically
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: "100%",
      height: "100%",
    },
    render: {
      antialias: false, // Deshabilitar antialiasing para mejor rendimiento
      pixelArt: true, // Activar para pixel art
      roundPixels: true, // Redondear pixeles para mejor renderizado
    },
  };
};

/**
 * Tile size in pixels (from tilemap)
 */
export const TILE_SIZE = 48;

/**
 * Map dimensions in tiles
 */
export const MAP_WIDTH_TILES = 40;
export const MAP_HEIGHT_TILES = 23;

/**
 * Map dimensions in pixels
 */
export const MAP_WIDTH = MAP_WIDTH_TILES * TILE_SIZE; // 1920
export const MAP_HEIGHT = MAP_HEIGHT_TILES * TILE_SIZE; // 1104

