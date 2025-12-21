import { defineWssRoute } from "@lolyjs/core";
import { z } from "zod";
import { initialBoard, checkWinner, isBoardFull, makeBotMove, makeMove, type Board } from "@/lib/game-logic";

/**
 * Game room state
 */
interface GameRoom {
  roomId: string;
  players: Array<{ id: string; name: string; symbol: "X" | "O" }>;
  board: Board;
  currentPlayer: "X" | "O";
  status: "waiting" | "playing" | "finished";
  winner: "X" | "O" | "draw" | null;
  bot: boolean;
  createdAt: number;
}

// In-memory store for game rooms
const rooms = new Map<string, GameRoom>();

/**
 * Clean up old finished rooms (older than 1 hour)
 */
function cleanupOldRooms() {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  for (const [roomId, room] of rooms.entries()) {
    if (room.status === "finished" && now - room.createdAt > oneHour) {
      rooms.delete(roomId);
    }
  }
}

// Cleanup every 30 minutes
setInterval(cleanupOldRooms, 30 * 60 * 1000);

export default defineWssRoute({
  /**
   * Authentication handler - extracts user from cookie
   * Cookie format: "name-id"
   */
  auth: async (ctx) => {
    const user = ctx.req.cookies?.["user"] || null;
    if (!user) return null;

    const parts = user.split("-");
    if (parts.length < 2) return null;

    return {
      name: parts[0] || "",
      id: parts.slice(1).join("-") || "",
    };
  },

  events: {
    /**
     * Create a new game room
     */
    createroom: {
      schema: z.object({
        bot: z.boolean().optional(),
      }),
      guard: ({ user }) => !!user,
      handler: (ctx) => {
        if (!ctx.user) return;

        const roomId = crypto.randomUUID();
        const bot = ctx.data.bot ?? false;

        const room: GameRoom = {
          roomId,
          players: [
            {
              id: ctx.user.id,
              name: ctx.user.name,
              symbol: "X",
            },
          ],
          board: initialBoard(),
          currentPlayer: "X",
          status: bot ? "playing" : "waiting",
          winner: null,
          bot,
          createdAt: Date.now(),
        };

        rooms.set(roomId, room);
        ctx.actions.join(roomId);

        // If bot game, add bot as player
        if (bot) {
          room.players.push({
            id: "bot",
            name: "Bot",
            symbol: "O",
          });
        }

        // Emit roomcreated to the user who created it
        ctx.actions.emit("roomcreated", { roomId, room });
        // Update room list for all clients
        ctx.actions.broadcast("roomlistupdated", { rooms: getAvailableRooms() });
      },
    },

    /**
     * Join an existing room
     */
    joinroom: {
      schema: z.object({
        roomId: z.string().uuid(),
      }),
      guard: ({ user }) => !!user,
      handler: (ctx) => {
        if (!ctx.user) return;

        const { roomId } = ctx.data;
        const room = rooms.get(roomId);

        if (!room) {
          return ctx.actions.error("ROOM_NOT_FOUND", "Room not found");
        }

        if (room.status !== "waiting") {
          return ctx.actions.error("ROOM_NOT_AVAILABLE", "Room is not available");
        }

        if (room.players.length >= 2) {
          return ctx.actions.error("ROOM_FULL", "Room is full");
        }

        // Check if user is already in the room
        if (room.players.some((p) => p.id === ctx.user!.id)) {
          return ctx.actions.error("ALREADY_IN_ROOM", "You are already in this room");
        }

        // Add second player
        room.players.push({
          id: ctx.user.id,
          name: ctx.user.name,
          symbol: "O",
        });

        room.status = "playing";
        ctx.actions.join(roomId);

        // Notify both players
        ctx.actions.toRoom(roomId).emit("playerjoined", {
          room,
          player: {
            id: ctx.user.id,
            name: ctx.user.name,
            symbol: "O",
          },
        });

        ctx.actions.toRoom(roomId).emit("gamestate", { room });
        ctx.actions.emit("roomlistupdated", { rooms: getAvailableRooms() });
      },
    },

    /**
     * Make a move on the board
     */
    makemove: {
      schema: z.object({
        roomId: z.string().uuid(),
        position: z.number().int().min(0).max(8),
      }),
      guard: ({ user }) => !!user,
      handler: (ctx) => {
        if (!ctx.user) return;

        const { roomId, position } = ctx.data;
        const room = rooms.get(roomId);

        if (!room) {
          return ctx.actions.error("ROOM_NOT_FOUND", "Room not found");
        }

        if (room.status !== "playing") {
          return ctx.actions.error("GAME_NOT_ACTIVE", "Game is not active");
        }

        // Find player
        const player = room.players.find((p) => p.id === ctx.user!.id);
        if (!player) {
          return ctx.actions.error("NOT_IN_ROOM", "You are not in this room");
        }

        // Check if it's player's turn
        if (room.currentPlayer !== player.symbol) {
          return ctx.actions.error("NOT_YOUR_TURN", "It's not your turn");
        }

        // Make the move
        const newBoard = makeMove(room.board, position, player.symbol);
        if (!newBoard) {
          return ctx.actions.error("INVALID_MOVE", "Invalid move");
        }

        room.board = newBoard;

        // Check for winner
        const winner = checkWinner(room.board);
        if (winner) {
          room.status = "finished";
          room.winner = winner;
        } else if (isBoardFull(room.board)) {
          room.status = "finished";
          room.winner = "draw";
        } else {
          // Switch turn
          room.currentPlayer = room.currentPlayer === "X" ? "O" : "X";
        }

        // Notify all players in the room
        ctx.actions.toRoom(roomId).emit("movemade", {
          room,
          position,
          player: player.symbol,
        });

        ctx.actions.toRoom(roomId).emit("gamestate", { room });

        // If bot game and game continues, make bot move
        if (room.bot && room.status === "playing" && room.currentPlayer === "O") {
          setTimeout(() => {
            const botPosition = makeBotMove(room.board, "O");
            if (botPosition >= 0) {
              const botBoard = makeMove(room.board, botPosition, "O");
              if (botBoard) {
                room.board = botBoard;

                const botWinner = checkWinner(room.board);
                if (botWinner) {
                  room.status = "finished";
                  room.winner = botWinner;
                } else if (isBoardFull(room.board)) {
                  room.status = "finished";
                  room.winner = "draw";
                } else {
                  room.currentPlayer = "X";
                }

                ctx.actions.toRoom(roomId).emit("movemade", {
                  room,
                  position: botPosition,
                  player: "O",
                });

                ctx.actions.toRoom(roomId).emit("gamestate", { room });
              }
            }
          }, 500); // Small delay for better UX
        }
      },
    },

    /**
     * Get list of available rooms
     */
    listrooms: {
      guard: ({ user }) => !!user,
      handler: (ctx) => {
        ctx.actions.reply("roomlist", { rooms: getAvailableRooms() });
      },
    },

    /**
     * Get current game state
     */
    getgamestate: {
      schema: z.object({
        roomId: z.string().uuid(),
      }),
      guard: ({ user }) => !!user,
      handler: (ctx) => {
        if (!ctx.user) return;

        const { roomId } = ctx.data;
        const room = rooms.get(roomId);

        if (!room) {
          return ctx.actions.error("ROOM_NOT_FOUND", "Room not found");
        }

        // Check if user is in the room
        if (!room.players.some((p) => p.id === ctx.user!.id)) {
          return ctx.actions.error("NOT_IN_ROOM", "You are not in this room");
        }

        // Ensure socket is in the room to receive updates
        ctx.actions.join(roomId);

        ctx.actions.reply("gamestate", { room });
      },
    },

    /**
     * Leave a room
     */
    leaveroom: {
      schema: z.object({
        roomId: z.string().uuid(),
      }),
      guard: ({ user }) => !!user,
      handler: (ctx) => {
        if (!ctx.user) return;

        const { roomId } = ctx.data;
        const room = rooms.get(roomId);

        if (room) {
          ctx.actions.leave(roomId);
          
          // Remove player from room
          room.players = room.players.filter((p) => p.id !== ctx.user!.id);

          // If room becomes empty or only bot remains, delete it
          if (room.players.length === 0 || (room.players.length === 1 && room.players[0].id === "bot")) {
            rooms.delete(roomId);
          } else {
            // Notify remaining players
            ctx.actions.toRoom(roomId).emit("playerleft", {
              room,
              playerId: ctx.user.id,
            });
          }

          ctx.actions.emit("roomlistupdated", { rooms: getAvailableRooms() });
        }
      },
    },

    /**
     * Reset game (start new game in same room)
     */
    resetgame: {
      schema: z.object({
        roomId: z.string().uuid(),
      }),
      guard: ({ user }) => !!user,
      handler: (ctx) => {
        if (!ctx.user) return;

        const { roomId } = ctx.data;
        const room = rooms.get(roomId);

        if (!room) {
          return ctx.actions.error("ROOM_NOT_FOUND", "Room not found");
        }

        // Check if user is in the room
        if (!room.players.some((p) => p.id === ctx.user!.id)) {
          return ctx.actions.error("NOT_IN_ROOM", "You are not in this room");
        }

        // Reset game state
        room.board = initialBoard();
        room.currentPlayer = "X";
        room.status = room.players.length === 2 || room.bot ? "playing" : "waiting";
        room.winner = null;

        ctx.actions.toRoom(roomId).emit("gamestate", { room });
      },
    },
  },
});

/**
 * Get list of available rooms (waiting for second player)
 */
function getAvailableRooms(): Array<{
  roomId: string;
  players: number;
  playerName: string;
  bot: boolean;
}> {
  return Array.from(rooms.values())
    .filter((room) => room.status === "waiting" && room.players.length === 1)
    .map((room) => ({
      roomId: room.roomId,
      players: room.players.length,
      playerName: room.players[0]?.name || "Unknown",
      bot: room.bot,
    }));
}

