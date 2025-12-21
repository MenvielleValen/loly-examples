import type Phaser from "phaser";
import type { OfficeObject, Player, ChatMessage } from "@/lib/office/types";
import { getPhaserConfig } from "./config";

/**
 * Wrapper class for Phaser game instance
 * Manages game lifecycle and provides access to the scene
 * Note: Phaser is loaded dynamically to avoid SSR issues
 */
export class PhaserGame {
  private game: Phaser.Game | null = null;
  private scene: any = null; // OfficeScene type, but imported dynamically
  private PhaserModule: typeof Phaser | null = null;
  private OfficeScene: any = null;

  /**
   * Initialize Phaser game (client-side only)
   * @param containerId - ID of the container element
   */
  async init(containerId: string): Promise<void> {
    // Only run on client
    if (typeof window === "undefined") {
      console.warn("Phaser can only be initialized on the client");
      return;
    }

    if (this.game) {
      console.warn("Phaser game already initialized");
      return;
    }

    try {
      // Dynamic imports to avoid SSR
      const [PhaserModule, { OfficeScene }, phaserConfig] = await Promise.all([
        import("phaser"),
        import("./scenes/OfficeScene"),
        getPhaserConfig(),
      ]);

      this.PhaserModule = PhaserModule.default;
      
      // Make Phaser available globally for OfficeScene methods
      (window as any).Phaser = this.PhaserModule;
      
      // Create a proper Phaser Scene class that uses OfficeScene as a mixin
      const PhaserScene = this.PhaserModule.Scene;
      
      // Create scene class that extends Phaser.Scene and includes OfficeScene methods
      class GameScene extends PhaserScene {
        // OfficeScene state
        private map: any;
        private tilesets: any[] = [];
        private floorLayer: any;
        private wallsLayer: any;
        private collisionLayer: any;
        private players: Map<string, any> = new Map();
        private playerSprites: Map<string, any> = new Map();
        private playerNames: Map<string, any> = new Map();
        private chatBubbles: Map<string, any> = new Map();
        private localPlayerId: string | null = null;
        private localPlayerSprite: any = null;
        private cursors: any;
        private wasdKeys: any;
        private lastMovementUpdate: number = 0;
        private movementCallback: ((x: number, y: number, animation?: string) => void) | null = null;
        private sitCallback: ((objectId: string, action: 'sit' | 'stand') => void) | null = null;
        private lastFacing: "up" | "down" | "left" | "right" = "down";
        private lastPlayerDepth: number = 0;
        private remotePlayersDepth: Map<string, number> = new Map();
        private remotePlayerStates: Map<string, {
          prev: { x: number; y: number };
          next: { x: number; y: number };
          lastUpdate: number;
        }> = new Map();
        private officeObjects: OfficeObject[] = [];
        
        // Declare methods that will be assigned from OfficeScene
        declare preload: () => void;
        declare create: () => void;
        declare update: () => void;
        declare setLocalPlayerId: (id: string) => void;
        declare setMovementCallback: (cb: (x: number, y: number, animation?: string) => void) => void;
        declare setSitCallback: (cb: (objectId: string, action: 'sit' | 'stand') => void) => void;
        declare addPlayer: (player: Player, isLocal: boolean) => void;
        declare updatePlayer: (player: Player) => void;
        declare removePlayer: (playerId: string) => void;
        declare showChatBubble: (playerId: string, message: ChatMessage) => void;
        declare setOfficeObjects: (objects: OfficeObject[]) => void;
        declare createAnimations: () => void;
        declare interpolateRemotePlayers: () => void;
        
        constructor() {
          super({ key: "OfficeScene" });
          
          // Copy OfficeScene methods to this instance
          // Using arrow functions to preserve 'this' context
          this.preload = () => OfficeScene.prototype.preload.call(this);
          this.create = () => OfficeScene.prototype.create.call(this);
          this.update = () => OfficeScene.prototype.update.call(this);
          this.setLocalPlayerId = (id: string) => OfficeScene.prototype.setLocalPlayerId.call(this, id);
          this.setMovementCallback = (cb: (x: number, y: number, animation?: string) => void) => OfficeScene.prototype.setMovementCallback.call(this, cb);
          this.setSitCallback = (cb: (objectId: string, action: 'sit' | 'stand') => void) => OfficeScene.prototype.setSitCallback.call(this, cb);
          this.addPlayer = (player: Player, isLocal: boolean) => OfficeScene.prototype.addPlayer.call(this, player, isLocal);
          this.updatePlayer = (player: Player) => OfficeScene.prototype.updatePlayer.call(this, player);
          this.removePlayer = (playerId: string) => OfficeScene.prototype.removePlayer.call(this, playerId);
          this.showChatBubble = (playerId: string, message: ChatMessage) => OfficeScene.prototype.showChatBubble.call(this, playerId, message);
          this.setOfficeObjects = (objects: OfficeObject[]) => OfficeScene.prototype.setOfficeObjects.call(this, objects);
          this.createAnimations = () => (OfficeScene.prototype as any).createAnimations.call(this);
          this.interpolateRemotePlayers = () => (OfficeScene.prototype as any).interpolateRemotePlayers.call(this);
        }
      }
      
      this.OfficeScene = GameScene;

      const config = {
        ...phaserConfig,
        parent: containerId,
        scene: [this.OfficeScene],
      };

      console.log("Creating Phaser game with config:", config);
      this.game = new this.PhaserModule.Game(config);
      console.log("Phaser game created");

      // Wait for game to be ready and scene to be created
      this.game.events.once("ready", () => {
        console.log("Phaser game is ready");
        const sceneInstance = this.game?.scene.getScene("OfficeScene");
        if (sceneInstance) {
          console.log("OfficeScene found");
          this.scene = sceneInstance;
        } else {
          console.warn("OfficeScene not found after game ready");
        }
      });

      // Also try to get scene after a delay as fallback
      setTimeout(() => {
        if (!this.scene) {
          const sceneInstance = this.game?.scene.getScene("OfficeScene");
          if (sceneInstance) {
            console.log("OfficeScene found via timeout fallback");
            this.scene = sceneInstance;
          }
        }
      }, 500);
    } catch (error) {
      console.error("Failed to initialize Phaser:", error);
    }
  }

  /**
   * Get the OfficeScene instance
   */
  getScene(): any {
    if (!this.scene && this.game) {
      this.scene = this.game.scene.getScene("OfficeScene");
    }
    return this.scene;
  }

  /**
   * Destroy the Phaser game instance
   */
  destroy(): void {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
      this.scene = null;
    }
  }

  /**
   * Check if game is initialized
   */
  isInitialized(): boolean {
    return this.game !== null;
  }
}

