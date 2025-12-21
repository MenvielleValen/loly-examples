import { defineWssRoute } from "@lolyjs/core";
import { z } from "zod";
import type { Player, ChatMessage } from "@/lib/office/types";
import { DEFAULT_OFFICE_OBJECTS, PLAYER_WIDTH, PLAYER_HEIGHT } from "@/lib/office/constants";

// Store players in memory (in production, consider using Redis for multi-instance)
const players = new Map<string, Player>();
const chatMessages = new Map<string, ChatMessage>();

// Handle disconnections using socket.io disconnect event
// We'll handle this in the handler by tracking connections

// Schema for player movement
const playerMoveSchema = z.object({
  x: z.number().min(0),
  y: z.number().min(0),
});

// Schema for chat message
const playerChatSchema = z.object({
  message: z.string().min(1).max(100),
});

// Schema for object interaction
const objectInteractSchema = z.object({
  objectId: z.string(),
});

// Schema for player sit/stand
const playerSitSchema = z.object({
  objectId: z.string(),
  action: z.enum(['sit', 'stand']),
});

export default defineWssRoute({
  /**
   * Authentication handler - extracts user from cookie.
   * Cookie format: "name-id"
   */
  auth: async (ctx) => {
    const user = ctx.req.cookies?.["user"] || null;
    if (!user) return null;

    // Safely parse user from cookie format "name-id"
    const parts = user.split("-");
    if (parts.length < 2) return null;

    // ID might contain dashes (UUID), so take everything after first dash
    const name = parts[0] || "";
    const id = parts.slice(1).join("-") || "";

    return {
      name,
      id,
    };
  },

  events: {
    /**
     * Player join event - called when a player connects
     */
    player_join: {
      schema: z.object({}), // No data needed, user comes from auth
      guard: ({ user }) => !!user,
      handler: (ctx) => {
        if (!ctx.user) return;

        const { id, name } = ctx.user;

        // Add player to the map (if not already there)
        if (!players.has(id)) {
          const newPlayer: Player = {
            id,
            name,
            x: 100, // Starting position
            y: 100,
          };

          players.set(id, newPlayer);

          // Broadcast player join to all clients (including sender)
          ctx.actions.broadcast("player_joined", {
            player: newPlayer,
          });
        }

        // Send current state to the player
        ctx.actions.emit("office_state", {
          players: Array.from(players.values()),
          objects: DEFAULT_OFFICE_OBJECTS,
        });
      },
    },
    /**
     * Player movement event
     */
    player_move: {
      schema: playerMoveSchema,
      guard: ({ user }) => !!user,
      handler: (ctx) => {
        if (!ctx.user) return;

        const { id } = ctx.user;
        const { x, y } = ctx.data;

        // Update or create player position
        let player = players.get(id);
        if (!player && ctx.user) {
          player = {
            id,
            name: ctx.user.name,
            x,
            y,
          };
          players.set(id, player);
        } else if (player) {
          player.x = x;
          player.y = y;
          players.set(id, player);
        }

        // Broadcast updated position to all clients
        if (player) {
          ctx.actions.broadcast("player_move", {
            playerId: id,
            x,
            y,
          });
        }
      },
    },

    /**
     * Player chat message event
     */
    player_chat: {
      schema: playerChatSchema,
      guard: ({ user }) => !!user,
      handler: (ctx) => {
        if (!ctx.user) return;

        const { id, name } = ctx.user;
        const { message } = ctx.data;

        const chatMessage: ChatMessage = {
          playerId: id,
          playerName: name,
          message,
          timestamp: Date.now(),
        };

        // Store latest message for this player
        chatMessages.set(id, chatMessage);

        // Broadcast chat message to all clients
        ctx.actions.emit("player_chat", chatMessage);
      },
    },

    /**
     * Object interaction event
     */
    object_interact: {
      schema: objectInteractSchema,
      guard: ({ user }) => !!user,
      handler: (ctx) => {
        if (!ctx.user) return;

        const { id: playerId, name } = ctx.user;
        const { objectId } = ctx.data;

        // Find the object
        const obj = DEFAULT_OFFICE_OBJECTS.find((o) => o.id === objectId);
        if (!obj || !obj.interactive) {
          return;
        }

        // Broadcast interaction to all clients
        ctx.actions.emit("object_interact", {
          playerId,
          playerName: name,
          objectId,
          objectType: obj.type,
          timestamp: Date.now(),
        });
      },
    },

    /**
     * Player sit/stand event
     */
    player_sit: {
      schema: playerSitSchema,
      guard: ({ user }) => !!user,
      handler: (ctx) => {
        if (!ctx.user) return;

        const { id } = ctx.user;
        const { objectId, action } = ctx.data;

        // Find the object (must be a chair)
        const obj = DEFAULT_OFFICE_OBJECTS.find((o) => o.id === objectId);
        if (!obj || obj.type !== 'chair') {
          return;
        }

        const player = players.get(id);
        if (!player) return;

        if (action === 'sit') {
          // Sit on the chair
          player.isSitting = true;
          player.sittingOn = objectId;
          // Position player on chair center
          player.x = obj.x + obj.width / 2 - PLAYER_WIDTH / 2; // Center player on chair
          player.y = obj.y + obj.height / 2 - PLAYER_HEIGHT / 2;
        } else {
          // Stand up - find a valid position without collisions
          player.isSitting = false;
          player.sittingOn = undefined;
          
          // Try different positions around the chair to avoid collisions
          const chairCenterX = obj.x + obj.width / 2;
          const chairCenterY = obj.y + obj.height / 2;
          
          // Try positions with more spacing: above, below, left, right of chair
          const spacing = 15; // More spacing to avoid nearby objects
          const tryPositions = [
            { x: chairCenterX - PLAYER_WIDTH / 2, y: obj.y - PLAYER_HEIGHT - spacing }, // Above (preferred)
            { x: obj.x - PLAYER_WIDTH - spacing, y: chairCenterY - PLAYER_HEIGHT / 2 }, // Left
            { x: obj.x + obj.width + spacing, y: chairCenterY - PLAYER_HEIGHT / 2 }, // Right
            { x: chairCenterX - PLAYER_WIDTH / 2, y: obj.y + obj.height + spacing }, // Below
          ];
          
          // Find first position without collision (excluding the chair itself)
          let foundPosition = false;
          for (const pos of tryPositions) {
            // Check boundaries
            if (pos.x < 0 || pos.y < 0 || pos.x + PLAYER_WIDTH > 2000 || pos.y + PLAYER_HEIGHT > 1500) {
              continue;
            }
            
            // Check collisions with all objects except the chair we're standing up from
            const hasCollision = DEFAULT_OFFICE_OBJECTS.some((o) => {
              if (o.id === objectId) return false; // Skip the chair we're standing up from
              return (
                pos.x < o.x + o.width &&
                pos.x + PLAYER_WIDTH > o.x &&
                pos.y < o.y + o.height &&
                pos.y + PLAYER_HEIGHT > o.y
              );
            });
            
            if (!hasCollision) {
              player.x = pos.x;
              player.y = pos.y;
              foundPosition = true;
              break;
            }
          }
          
          // Fallback: try positions further away if nearby positions all collide
          if (!foundPosition) {
            const farSpacing = 30;
            const farPositions = [
              { x: chairCenterX - PLAYER_WIDTH / 2, y: obj.y - PLAYER_HEIGHT - farSpacing },
              { x: obj.x - PLAYER_WIDTH - farSpacing, y: chairCenterY - PLAYER_HEIGHT / 2 },
              { x: obj.x + obj.width + farSpacing, y: chairCenterY - PLAYER_HEIGHT / 2 },
            ];
            
            for (const pos of farPositions) {
              if (pos.x < 0 || pos.y < 0 || pos.x + PLAYER_WIDTH > 2000 || pos.y + PLAYER_HEIGHT > 1500) {
                continue;
              }
              
              const hasCollision = DEFAULT_OFFICE_OBJECTS.some((o) => {
                if (o.id === objectId) return false;
                return (
                  pos.x < o.x + o.width &&
                  pos.x + PLAYER_WIDTH > o.x &&
                  pos.y < o.y + o.height &&
                  pos.y + PLAYER_HEIGHT > o.y
                );
              });
              
              if (!hasCollision) {
                player.x = pos.x;
                player.y = pos.y;
                foundPosition = true;
                break;
              }
            }
          }
          
          // Last resort: position far above chair
          if (!foundPosition) {
            player.x = chairCenterX - PLAYER_WIDTH / 2;
            player.y = obj.y - PLAYER_HEIGHT - 50; // Far above
          }
        }

        players.set(id, player);

        // Broadcast to all clients
        ctx.actions.emit("player_sit", {
          playerId: id,
          objectId,
          action,
          x: player.x,
          y: player.y,
        });
      },
    },
  },
});
