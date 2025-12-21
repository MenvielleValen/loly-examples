// This file will be loaded dynamically on the client side only
// Phaser will be imported at runtime to avoid SSR issues

import type { Player, ChatMessage, OfficeObject } from "@/lib/office/types";
import { MAP_WIDTH, MAP_HEIGHT, TILE_SIZE } from "../config";
import { MOVEMENT_UPDATE_INTERVAL, CHAT_BUBBLE_DURATION } from "@/lib/office/constants";

/**
 * OfficeScene - Main Phaser scene for the office
 * Handles rendering, input, and synchronization with Loly WebSocket
 * Note: Methods will be bound to a Phaser.Scene instance at runtime
 */
export class OfficeScene {
  // These will be available from the Phaser.Scene instance
  // They're typed as any to avoid SSR issues
  declare scene: any;
  declare add: any;
  declare make: any;
  declare load: any;
  declare input: any;
  declare cameras: any;
  declare physics: any;
  declare matter: any; // Matter.js physics
  declare time: any;
  declare textures: any;
  declare anims: any;
  declare sound: any;
  // Map and layers
  private map!: any; // Phaser.Tilemaps.Tilemap
  private tilesets: any[] = []; // Phaser.Tilemaps.Tileset[]
  private floorLayer!: any; // Phaser.Tilemaps.TilemapLayer
  private wallsLayer!: any; // Phaser.Tilemaps.TilemapLayer
  private collisionLayer!: any; // Phaser.Tilemaps.TilemapLayer

  // Players
  private players: Map<string, any> = new Map(); // Map<string, Phaser.GameObjects.Container>
  private playerSprites: Map<string, any> = new Map(); // Map<string, Phaser.GameObjects.Sprite>
  private playerNames: Map<string, any> = new Map(); // Map<string, Phaser.GameObjects.Text>
  private chatBubbles: Map<string, any> = new Map(); // Map<string, Phaser.GameObjects.Container>

  // Local player
  private localPlayerId: string | null = null;
  private localPlayerSprite: any = null; // Phaser.GameObjects.Sprite | null
  private cursors!: any; // Phaser.Types.Input.Keyboard.CursorKeys
  private wasdKeys!: {
    w: any; // Phaser.Input.Keyboard.Key
    a: any;
    s: any;
    d: any;
    e: any;
  };

  // Movement
  private lastMovementUpdate: number = 0;
  private movementCallback: ((x: number, y: number, animation?: string) => void) | null = null;
  private sitCallback: ((objectId: string, action: 'sit' | 'stand') => void) | null = null;
  private lastFacing: "up" | "down" | "left" | "right" = "down";
  private lastPlayerDepth: number = 0;
  private remotePlayersDepth: Map<string, number> = new Map();

  // Interpolation for remote players
  private remotePlayerStates: Map<string, {
    prev: { x: number; y: number };
    next: { x: number; y: number };
    lastUpdate: number;
  }> = new Map();

  // Office objects
  private officeObjects: OfficeObject[] = [];

  constructor(config?: any) {
    // Scene will be initialized by Phaser at runtime
    // This constructor is called by Phaser when creating the scene
  }

  preload(): void {
    console.log("OfficeScene.preload() called", {
      hasLoad: !!this.load,
      hasAdd: !!this.add,
      hasMake: !!this.make,
    });

    // Load tilemap
    this.load.tilemapTiledJSON("office-map", "/assets/tilemap.json");

    // Load tilesets
    this.load.image("tileset-atlas", "/assets/atlas_48x.png");
    this.load.image("tileset-interiors", "/assets/Interiors_free_48x48.png");
    this.load.image("tileset-room", "/assets/Room_Builder_free_48x48.png");

    // Load character sprites
    // Using frameWidth: 64, frameHeight: 64 as per reference project
    this.load.spritesheet("luis-walk", "/assets/characters/luis/walk.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("sofia-walk", "/assets/characters/sofia/walk.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("luis-dance", "/assets/characters/luis/dance.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("sofia-dance", "/assets/characters/sofia/dance.png", {
      frameWidth: 64,
      frameHeight: 64,
    });

    // Load music (optional)
    this.load.audio("bg-music", "/music/Pixel-Dreams.mp3");
    this.load.audio("notification", "/music/notification.wav");
  }

  create(): void {
    console.log("OfficeScene.create() called", {
      hasMake: !!this.make,
      hasAdd: !!this.add,
      hasInput: !!this.input,
      hasCameras: !!this.cameras,
      hasPhysics: !!this.physics,
    });

    // Create tilemap
    if (!this.make) {
      console.error("this.make is not available!");
      return;
    }
    
    this.map = this.make.tilemap({ key: "office-map" });
    
    if (!this.map) {
      console.error("Failed to create tilemap");
      return;
    }
    
    console.log("Tilemap created successfully");

    // Get tilesets from the map and add images
    const atlasTileset = this.map.addTilesetImage("tileset_1", "tileset-atlas", TILE_SIZE, TILE_SIZE);
    const interiorsTileset = this.map.addTilesetImage("tileset_2", "tileset-interiors", TILE_SIZE, TILE_SIZE);
    const roomTileset = this.map.addTilesetImage("tileset_3", "tileset-room", TILE_SIZE, TILE_SIZE);

    if (atlasTileset) this.tilesets.push(atlasTileset);
    if (interiorsTileset) this.tilesets.push(interiorsTileset);
    if (roomTileset) this.tilesets.push(roomTileset);
    
    console.log(`Loaded ${this.tilesets.length} tilesets`);

    // Create layers (order matters for rendering)
    const floorLayer = this.map.getLayer("floor");
    if (floorLayer) {
      this.floorLayer = this.map.createLayer("floor", this.tilesets, 0, 0)!;
    }

    const carpetsLayer = this.map.getLayer("carpets");
    if (carpetsLayer) {
      this.map.createLayer("carpets", this.tilesets, 0, 0);
    }

    const wallsLayer = this.map.getLayer("walls");
    if (wallsLayer) {
      this.wallsLayer = this.map.createLayer("walls", this.tilesets, 0, 0)!;
    }

    // Create other decorative layers
    const chairsLayer = this.map.getLayer("chairs");
    let chairsLayerObj: any = null;
    if (chairsLayer) {
      chairsLayerObj = this.map.createLayer("chairs", this.tilesets, 0, 0);
    }

    const lowerFlowersLayer = this.map.getLayer("lowerFlowers");
    let lowerFlowersLayerObj: any = null;
    if (lowerFlowersLayer) {
      lowerFlowersLayerObj = this.map.createLayer("lowerFlowers", this.tilesets, 0, 0);
    }

    const upperPcLayer = this.map.getLayer("upperPc");
    if (upperPcLayer) {
      this.map.createLayer("upperPc", this.tilesets, 0, 0);
    }

    // Set collision properties and convert to Matter.js
    if (this.wallsLayer) {
      this.wallsLayer.setCollisionByProperty({ collider: true });
      this.collisionLayer = this.wallsLayer;
    }
    
    if (chairsLayerObj) {
      chairsLayerObj.setCollisionByProperty({ collider: true });
    }
    
    if (lowerFlowersLayerObj) {
      lowerFlowersLayerObj.setCollisionByProperty({ collider: true });
    }

    // Convert tilemap layers to Matter.js bodies
    if (this.wallsLayer) {
      this.matter.world.convertTilemapLayer(this.wallsLayer);
    }
    if (chairsLayerObj) {
      this.matter.world.convertTilemapLayer(chairsLayerObj);
    }
    if (lowerFlowersLayerObj) {
      this.matter.world.convertTilemapLayer(lowerFlowersLayerObj);
    }

    // Set world bounds (Matter.js uses different method)
    this.matter.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);

    // Setup camera
    this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    this.cameras.main.setZoom(1);

    // Setup input
    const Phaser = (window as any).Phaser || require("phaser");
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasdKeys = {
      w: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      e: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E),
    };
    
    console.log("Input setup complete");
    
    // Setup camera bounds and initial position
    this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    this.cameras.main.setZoom(1);
    console.log("Camera setup complete", {
      bounds: { width: MAP_WIDTH, height: MAP_HEIGHT },
      zoom: this.cameras.main.zoom,
    });

    // Create character animations
    this.createAnimations();

    // Play background music (optional)
    // const music = this.sound.add("bg-music", { loop: true, volume: 0.3 });
    // music.play();
  }

  createAnimations(): void {
    // Animations config based on reference project
    // walk: up (0-8), left (9-17), down (18-26), right (27-35)
    // idle: idle-up (frame 5), idle-left (frame 9), idle-down (frame 19), idle-right (frame 27)
    const animationsConfig = {
      walk: [
        { key: "up", start: 0, end: 8 },
        { key: "left", start: 9, end: 17 },
        { key: "down", start: 18, end: 26 },
        { key: "right", start: 27, end: 35 },
        { key: "idle-up", idleFrame: 5 },
        { key: "idle-left", idleFrame: 9 },
        { key: "idle-down", idleFrame: 19 },
        { key: "idle-right", idleFrame: 27 },
      ],
      dance: [
        { key: "dance-up", start: 0, end: 5, repeat: 3 },
        { key: "dance-left", start: 6, end: 11, repeat: 3 },
        { key: "dance-down", start: 12, end: 17, repeat: 3 },
        { key: "dance-right", start: 18, end: 23, repeat: 3 },
      ],
    };

    // Create animations for both luis and sofia
    ["luis", "sofia"].forEach((character) => {
      Object.entries(animationsConfig).forEach(([animationKey, animations]) => {
        const textureKey = `${character}-${animationKey}`;
        animations.forEach((animation) => {
          const { key, start, end, repeat, idleFrame } = animation as any;
          const fullKey = `${character}-${key}`;

          if (idleFrame !== undefined) {
            // Idle animation (single frame)
            this.anims.create({
              key: fullKey,
              frames: [{ key: textureKey, frame: idleFrame }],
              frameRate: 10,
              repeat: 0,
            });
          } else {
            // Movement animation
            this.anims.create({
              key: fullKey,
              frames: this.anims.generateFrameNumbers(textureKey, { start, end }),
              frameRate: 10,
              repeat: repeat !== undefined ? repeat : -1,
            });
          }
        });
      });
    });
  }

  update(): void {
    const Phaser = (window as any).Phaser || require("phaser");
    if (!this.localPlayerSprite || !this.localPlayerId) {
      // Log once if sprite is missing
      if (this.localPlayerId && !this.localPlayerSprite) {
        console.warn("Local player ID set but sprite is missing:", this.localPlayerId);
      }
      return;
    }

    // Check if input is focused (don't move if user is typing)
    const activeElement = document.activeElement;
    const isInputFocused = activeElement && (
      activeElement.tagName === 'INPUT' || 
      activeElement.tagName === 'TEXTAREA' ||
      (activeElement as HTMLElement).isContentEditable
    );
    
    if (isInputFocused) {
      // Don't process movement if user is typing
      // Still update name text position even when not moving
      const sprite = this.players.get(this.localPlayerId);
      if (sprite) {
        const nameText = this.playerNames.get(this.localPlayerId);
        if (nameText) {
          nameText.setPosition(sprite.x, sprite.y - 40);
          nameText.setDepth(sprite.y + 1);
        }
        // Update chat bubble position if it exists
        const chatBubble = this.chatBubbles.get(this.localPlayerId);
        if (chatBubble) {
          chatBubble.setPosition(sprite.x, sprite.y - 40 - 30);
          chatBubble.setDepth(sprite.y + 2);
        }
      }
      // Continue interpolating remote players
      this.interpolateRemotePlayers();
      return;
    }

    // Handle movement input using velocity (like reference project)
    const speed = 2.7; // Match reference project speed
    let velocityX = 0;
    let velocityY = 0;

    const cursors = this.cursors;
    const keys = this.wasdKeys;

    // Allow independent checks per axis for diagonal movement
    if (cursors || keys) {
      if (cursors?.left?.isDown || keys?.a?.isDown) velocityX = -speed;
      if (cursors?.right?.isDown || keys?.d?.isDown) velocityX = speed;
      if (cursors?.down?.isDown || keys?.s?.isDown) velocityY = speed;
      if (cursors?.up?.isDown || keys?.w?.isDown) velocityY = -speed;

      // Normalize diagonal velocity only if moving on both axes
      if (velocityX !== 0 && velocityY !== 0) {
        const mag = Math.hypot(velocityX, velocityY);
        if (mag > speed) {
          const scale = speed / mag;
          velocityX *= scale;
          velocityY *= scale;
        }
      }
    }

    const sprite = this.players.get(this.localPlayerId);
    if (!sprite) return;

    // Set velocity (Matter.js handles movement and collisions)
    sprite.setVelocity(velocityX, velocityY);

    // Choose animation: idle if no movement, or based on dominant direction
    const characterType = this.localPlayerId.includes("luis") ? "luis" : "sofia";
    if (velocityX === 0 && velocityY === 0) {
      sprite.anims.play(`${characterType}-idle-${this.lastFacing}` as any, true);
    } else {
      const absVelX = Math.abs(velocityX);
      const absVelY = Math.abs(velocityY);

      const direction =
        absVelX >= absVelY
          ? velocityX < 0
            ? "left"
            : "right"
          : velocityY < 0
          ? "up"
          : "down";

      this.lastFacing = direction;
      sprite.anims.play(`${characterType}-${direction}` as any, true);
    }

    // Update name text position
    const nameText = this.playerNames.get(this.localPlayerId);
    if (nameText) {
      nameText.setPosition(sprite.x || 0, (sprite.y || 0) - 40);
    }

    // Optimize depth update: only update if changed >= 1 pixel
    if (sprite) {
      const newDepth = Math.floor(sprite.y);
      if (Math.abs(this.lastPlayerDepth - newDepth) >= 1) {
        sprite.setDepth(newDepth);
        this.lastPlayerDepth = newDepth;
      }
      if (nameText) {
        nameText.setDepth(newDepth + 1);
      }
    }

    // Update chat bubble position if it exists
    const chatBubble = this.chatBubbles.get(this.localPlayerId);
    if (chatBubble) {
      chatBubble.setPosition(sprite.x, sprite.y - 40 - 30);
      chatBubble.setDepth(sprite.y + 2);
    }

    // INTERPOLATION FOR REMOTE PLAYERS
    this.interpolateRemotePlayers();

    // Send movement update (throttled) with animation
    const now = Date.now();
    if (now - this.lastMovementUpdate >= MOVEMENT_UPDATE_INTERVAL && this.movementCallback) {
      const currentAnimKey = sprite.anims?.currentAnim?.key || `${characterType}-idle-${this.lastFacing}`;
      this.movementCallback(sprite.x, sprite.y, currentAnimKey);
      this.lastMovementUpdate = now;
    }

    // Update camera to follow local player sprite
    if (sprite) {
      this.cameras.main.startFollow(sprite, true, 0.1, 0.1);
    } else if (this.localPlayerSprite) {
      // Fallback to localPlayerSprite
      this.cameras.main.startFollow(this.localPlayerSprite, true, 0.1, 0.1);
    }

    // Handle sit/stand (E key) - only if input is not focused
    if (!isInputFocused && Phaser.Input.Keyboard.JustDown(this.wasdKeys.e) && this.sitCallback && this.localPlayerId) {
      // Find nearest chair
      const sprite = this.players.get(this.localPlayerId);
      if (!sprite) return;
      
      let nearestChair: OfficeObject | null = null;
      let minDistance = 80; // Increased distance for easier interaction

      for (const obj of this.officeObjects) {
        if (obj.type === "chair" && obj.interactive) {
          const distance = Phaser.Math.Distance.Between(
            sprite.x,
            sprite.y,
            obj.x + obj.width / 2,
            obj.y + obj.height / 2
          );
          if (distance < minDistance) {
            minDistance = distance;
            nearestChair = obj;
          }
        }
      }

      if (nearestChair) {
        // Get current player state to determine if sitting or standing
        // Store sitting state on the sprite
        const isSitting = sprite.getData("isSitting") || false;
        const sittingOn = sprite.getData("sittingOn");
        
        if (isSitting && sittingOn === nearestChair.id) {
          // Stand up
          console.log("Standing up from chair:", nearestChair.id);
          this.sitCallback(nearestChair.id, 'stand');
        } else if (!isSitting) {
          // Sit down
          console.log("Sitting on chair:", nearestChair.id);
          this.sitCallback(nearestChair.id, 'sit');
        }
      }
    }
  }

  /**
   * Set the local player ID
   */
  setLocalPlayerId(playerId: string): void {
    this.localPlayerId = playerId;
  }

  /**
   * Set callback for movement updates
   */
  setMovementCallback(callback: (x: number, y: number, animation?: string) => void): void {
    this.movementCallback = callback;
  }

  /**
   * Set callback for sit/stand actions
   */
  setSitCallback(callback: (objectId: string, action: 'sit' | 'stand') => void): void {
    this.sitCallback = callback;
  }

  /**
   * Add or update a player
   */
  addPlayer(player: Player, isLocal: boolean = false): void {
    console.log(`Adding player ${player.name} (${player.id}), isLocal: ${isLocal}`, {
      position: { x: player.x, y: player.y },
      alreadyExists: this.players.has(player.id),
    });
    
    // If player already exists, just update it instead of creating a new one
    if (this.players.has(player.id)) {
      console.log(`Player ${player.id} already exists, updating instead of creating new`);
      this.updatePlayer(player);
      return;
    }
    
    // Double check - if sprite exists but not in map, destroy it first
    const existingSprite = this.playerSprites.get(player.id);
    if (existingSprite && !this.players.has(player.id)) {
      console.warn(`Found orphaned sprite for ${player.id}, destroying it`);
      existingSprite.destroy();
      this.playerSprites.delete(player.id);
    }

    // Choose character sprite based on player ID (alternate between luis and sofia)
    const characterType = player.id.charCodeAt(0) % 2 === 0 ? "luis" : "sofia";
    const spriteKey = `${characterType}-walk`;

    // Check if texture is loaded before creating sprite
    if (!this.textures.exists(spriteKey)) {
      console.warn(`Texture ${spriteKey} not loaded yet, skipping sprite creation`);
      return;
    }

    console.log(`Creating sprite with key: ${spriteKey}`, {
      hasTexture: this.textures.exists(spriteKey),
    });

    // Create sprite using Matter.js physics (like reference project)
    const sprite = this.matter.add.sprite(player.x, player.y, spriteKey);
    
    // Configure Matter.js body
    sprite.setBody({
      type: "rectangle",
      width: 28,
      height: 45,
    });
    sprite.setFixedRotation();
    sprite.setOrigin(0.5, 0.6); // Like reference project
    
    // Configure physics properties for smooth movement
    sprite.setBounce(0);
    sprite.setFriction(0);
    sprite.setFrictionAir(0);
    sprite.setMass(1);
    
    // Configure body properties
    if (sprite.body) {
      const body = sprite.body as any;
      body.inertia = Infinity;
      body.sleepThreshold = -1; // Evita micro-rebotes
      body.slop = 0.05; // Tolerancia en colisiones para movimiento más suave
    }
    
    sprite.setVisible(true);
    sprite.setDepth(player.y); // Use Y position for depth sorting
    
    // For remote players, make them sensors (no collisions)
    if (!isLocal) {
      sprite.setSensor(true);
    }

    // Set initial animation
    if (player.animation && sprite.anims) {
      // Use provided animation
      sprite.anims.play(player.animation, true);
    } else {
      // Default to idle-down
      sprite.anims.play(`${characterType}-idle-down`, true);
    }

    // Create name text - position it above the sprite
    const nameText = this.add.text(player.x, player.y - 40, player.name, {
      fontSize: "12px",
      color: "#000",
      backgroundColor: "#fff",
      padding: { x: 5, y: 2 },
    });
    nameText.setOrigin(0.5, 0.5);
    nameText.setDepth(player.y + 1); // Slightly above sprite depth

    // Store references
    // Store sprite directly for position updates (not container)
    this.players.set(player.id, sprite); // Store sprite instead of container
    this.playerSprites.set(player.id, sprite);
    this.playerNames.set(player.id, nameText);

    if (isLocal) {
      console.log(`Setting local player: ${player.id}`);
      this.localPlayerSprite = sprite;
      this.setLocalPlayerId(player.id);
      
      // Immediately set camera to follow local player sprite
      this.cameras.main.startFollow(sprite, true, 0.1, 0.1);
      this.cameras.main.setScroll(sprite.x - this.cameras.main.width / 2, sprite.y - this.cameras.main.height / 2);
      console.log(`Camera set to follow local player at:`, {
        spriteX: sprite.x,
        spriteY: sprite.y,
        cameraX: this.cameras.main.scrollX,
        cameraY: this.cameras.main.scrollY,
      });
    }
  }

  /**
   * Interpolate remote players for smooth movement
   */
  interpolateRemotePlayers(): void {
    const INTERPOLATION_DURATION = 140; // Align with throttle (~150ms)
    const now = Date.now();

    for (const [id, sprite] of this.players.entries()) {
      if (id === this.localPlayerId) continue;

      const state = this.remotePlayerStates.get(id);
      if (!sprite || !state) continue;

      const t = Math.min((now - state.lastUpdate) / INTERPOLATION_DURATION, 1);

      // Manual interpolation (more efficient than Phaser.Math.Interpolation.Linear)
      sprite.x = state.prev.x + (state.next.x - state.prev.x) * t;
      sprite.y = state.prev.y + (state.next.y - state.prev.y) * t;

      // If interpolation completed, ensure exact target position
      if (t >= 1) {
        sprite.x = state.next.x;
        sprite.y = state.next.y;
      }

      const nameText = this.playerNames.get(id);
      if (nameText) {
        nameText.setPosition(sprite.x, sprite.y - 40);
      }

      // Optimize depth: only update if changed significantly
      const newDepth = Math.floor(sprite.y);
      const currentDepth = this.remotePlayersDepth.get(id) || 0;
      if (Math.abs(currentDepth - newDepth) >= 1) {
        sprite.setDepth(newDepth);
        this.remotePlayersDepth.set(id, newDepth);
        if (nameText) {
          nameText.setDepth(newDepth + 1);
        }
      }
    }
  }

  /**
   * Update player position and state
   */
  updatePlayer(player: Player): void {
    const sprite = this.players.get(player.id);
    const nameText = this.playerNames.get(player.id);
    
    if (!sprite) return;

    // For remote players, store positions for interpolation
    if (player.id !== this.localPlayerId) {
      const now = Date.now();
      if (!this.remotePlayerStates.has(player.id)) {
        this.remotePlayerStates.set(player.id, {
          prev: { x: player.x, y: player.y },
          next: { x: player.x, y: player.y },
          lastUpdate: now,
        });
      } else {
        const state = this.remotePlayerStates.get(player.id)!;
        // Store current sprite position as previous
        state.prev.x = sprite.x;
        state.prev.y = sprite.y;
        // Store new position as next
        state.next.x = player.x;
        state.next.y = player.y;
        state.lastUpdate = now;
      }
      
      // Update animation for remote players
      if (player.animation && sprite.anims) {
        const currentAnim = sprite.anims.currentAnim?.key;
        if (currentAnim !== player.animation) {
          sprite.anims.play(player.animation, true);
        }
      }
    } else {
      // For local player, update directly (handled by velocity in update())
      sprite.x = player.x;
      sprite.y = player.y;
    }

    // Update depth based on Y position
    const newDepth = Math.floor(player.y);
    sprite.setDepth(newDepth);

    // Update name text position
    if (nameText) {
      nameText.x = player.x;
      nameText.y = player.y - 40;
      nameText.setDepth(newDepth + 1);
    }

    // Update chat bubble position if it exists
    const chatBubble = this.chatBubbles.get(player.id);
    if (chatBubble) {
      chatBubble.x = player.x;
      chatBubble.y = player.y - 40 - 30; // Above the name
      chatBubble.setDepth(newDepth + 2);
    }

    // Update sitting state
    if (player.isSitting) {
      const characterType = player.id.charCodeAt(0) % 2 === 0 ? "luis" : "sofia";
      sprite.anims.play(`${characterType}-idle-${this.lastFacing}` as any, true);
    }
  }

  /**
   * Remove a player
   */
  removePlayer(playerId: string): void {
    const sprite = this.players.get(playerId);
    const nameText = this.playerNames.get(playerId);
    const chatBubble = this.chatBubbles.get(playerId);
    
    if (sprite) {
      sprite.destroy();
    }
    if (nameText) {
      nameText.destroy();
    }
    if (chatBubble) {
      chatBubble.destroy();
    }
    
    this.players.delete(playerId);
    this.playerSprites.delete(playerId);
    this.playerNames.delete(playerId);
    this.chatBubbles.delete(playerId);
    this.remotePlayerStates.delete(playerId);
    this.remotePlayersDepth.delete(playerId);
  }

  /**
   * Show chat bubble for a player
   */
  showChatBubble(playerId: string, message: ChatMessage): void {
    const sprite = this.players.get(playerId);
    if (!sprite) return;

    // Remove existing bubble
    const existingBubble = this.chatBubbles.get(playerId);
    if (existingBubble) {
      existingBubble.destroy();
    }

    // Create new bubble positioned above the sprite (y - 40 for name, then -30 more for bubble)
    const bubbleContainer = this.add.container(sprite.x, sprite.y - 40 - 30);
    
    // Background
    const bg = this.add.rectangle(0, 0, 200, 40, 0xffffff, 1);
    bg.setStrokeStyle(2, 0x333333);
    
    // Text
    const text = this.add.text(0, 0, message.message, {
      fontSize: "14px",
      color: "#000",
      wordWrap: { width: 180 },
    });
    text.setOrigin(0.5);

    bubbleContainer.add([bg, text]);
    bubbleContainer.setDepth(sprite.y + 2); // Above player

    this.chatBubbles.set(playerId, bubbleContainer);

    // Remove bubble after duration
    this.time.delayedCall(CHAT_BUBBLE_DURATION, () => {
      const bubble = this.chatBubbles.get(playerId);
      if (bubble) {
        bubble.destroy();
        this.chatBubbles.delete(playerId);
      }
    });
  }

  /**
   * Set office objects for collision/interaction
   */
  setOfficeObjects(objects: OfficeObject[]): void {
    this.officeObjects = objects;
  }
}
