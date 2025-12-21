import { useEffect, useRef, useState, useCallback } from "react";
import { lolySocket } from "@lolyjs/core/sockets";
import type { Socket } from "socket.io-client";
import type { Player, ChatMessage, OfficeObject } from "@/lib/office/types";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_SPEED,
  PLAYER_SIZE,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  MOVEMENT_UPDATE_INTERVAL,
  CHAT_BUBBLE_DURATION,
  DEFAULT_OFFICE_OBJECTS,
  getPlayerColor,
} from "@/lib/office/constants";
import {
  checkPlayerCollision,
  clamp,
  loadImage,
  loadImages,
  findNearestInteractiveObject,
} from "@/lib/office/utils";
import { SPRITE_PATHS } from "@/lib/office/constants";

interface OfficeCanvasProps {
  user: { id: string; name: string };
}

export function OfficeCanvas({ user }: OfficeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const socketRef = useRef<Socket | null>(null);
  const lastMovementUpdateRef = useRef<number>(0);

  // Game state
  const [players, setPlayers] = useState<Map<string, Player>>(new Map());
  const [chatMessages, setChatMessages] = useState<Map<string, ChatMessage>>(new Map());
  const [objects] = useState<OfficeObject[]>(DEFAULT_OFFICE_OBJECTS);
  const [isConnected, setIsConnected] = useState(false);

  // Local player state
  const [localPlayerPos, setLocalPlayerPos] = useState({ x: 100, y: 100 });
  const [localPlayerSitting, setLocalPlayerSitting] = useState<{ isSitting: boolean; sittingOn?: string }>({ isSitting: false });
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [currentChatInput, setCurrentChatInput] = useState("");

  // Camera offset (follows local player)
  const [camera, setCamera] = useState({ x: 0, y: 0 });

  // Sprites
  const [sprites, setSprites] = useState<Map<string, HTMLImageElement>>(new Map());
  const [spritesLoaded, setSpritesLoaded] = useState(false);

  // Load sprites on mount
  useEffect(() => {
    // Try to load sprites, but continue even if they fail (fallback to colored rectangles)
    loadImages(SPRITE_PATHS)
      .then((loadedSprites) => {
        setSprites(loadedSprites);
        setSpritesLoaded(true);
      })
      .catch((error) => {
        console.warn("Failed to load some sprites, using fallback rendering", error);
        setSpritesLoaded(true); // Continue anyway
      });
  }, []);

  // WebSocket connection
  useEffect(() => {
    const ws = lolySocket("/office", {});
    socketRef.current = ws;

    ws.on("connect", () => {
      console.log("Connected to office");
      setIsConnected(true);
      // Emit player_join to notify server
      ws.emit("player_join", {});
    });

    ws.on("disconnect", () => {
      setIsConnected(false);
      // Clear players on disconnect (will be repopulated on reconnect)
      setPlayers(new Map());
    });

    ws.on("office_state", (data: { players: Player[]; objects: OfficeObject[] }) => {
      const playersMap = new Map<string, Player>();
      data.players.forEach((p) => playersMap.set(p.id, p));
      setPlayers(playersMap);

      // Set local player position from server
      const localPlayer = data.players.find((p) => p.id === user.id);
      if (localPlayer) {
        setLocalPlayerPos({ x: localPlayer.x, y: localPlayer.y });
      }
    });

    ws.on("player_joined", (data: { player: Player }) => {
      setPlayers((prev) => {
        const next = new Map(prev);
        next.set(data.player.id, data.player);
        return next;
      });
    });

    ws.on("player_leave", (data: { playerId: string }) => {
      setPlayers((prev) => {
        const next = new Map(prev);
        next.delete(data.playerId);
        return next;
      });
      setChatMessages((prev) => {
        const next = new Map(prev);
        next.delete(data.playerId);
        return next;
      });
    });

    ws.on("player_move", (data: { playerId: string; x: number; y: number }) => {
      if (data.playerId === user.id) return; // Skip local player updates (we use local position)

      // Update player position directly (more frequent updates make this smooth enough)
      setPlayers((prev) => {
        const next = new Map(prev);
        const player = next.get(data.playerId);
        if (player) {
          // Update existing player
          player.x = data.x;
          player.y = data.y;
          next.set(data.playerId, player);
        } else {
          // Player doesn't exist, but this shouldn't happen
          // They should have been added on player_joined
        }
        return next;
      });
    });

    ws.on("player_chat", (data: ChatMessage) => {
      setChatMessages((prev) => {
        const next = new Map(prev);
        next.set(data.playerId, data);
        return next;
      });

      // Remove chat message after duration
      setTimeout(() => {
        setChatMessages((prev) => {
          const next = new Map(prev);
          next.delete(data.playerId);
          return next;
        });
      }, CHAT_BUBBLE_DURATION);
    });

    ws.on("player_sit", (data: { playerId: string; objectId: string; action: 'sit' | 'stand'; x: number; y: number }) => {
      setPlayers((prev) => {
        const next = new Map(prev);
        const player = next.get(data.playerId);
        if (player) {
          player.x = data.x;
          player.y = data.y;
          player.isSitting = data.action === 'sit';
          player.sittingOn = data.action === 'sit' ? data.objectId : undefined;
          next.set(data.playerId, player);
        }
        return next;
      });

      // Update local player state if it's us
      if (data.playerId === user.id) {
        setLocalPlayerSitting({
          isSitting: data.action === 'sit',
          sittingOn: data.action === 'sit' ? data.objectId : undefined,
        });
        setLocalPlayerPos({ x: data.x, y: data.y });
      }
    });

    ws.on("__loly:error", (error: { code: string; message: string }) => {
      console.error("WebSocket error:", error.code, error.message);
    });

    return () => {
      ws.close();
    };
  }, [user.id]);

  // Keyboard input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return; // Don't capture if typing in input

      setKeys((prev) => {
        const next = new Set(prev);
        next.add(e.key.toLowerCase());
        return next;
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys((prev) => {
        const next = new Set(prev);
        next.delete(e.key.toLowerCase());
        return next;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Handle sit/stand with E key
  useEffect(() => {
    if (!isConnected || !socketRef.current) return;

    const handleSitKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'e' || e.target instanceof HTMLInputElement) return;
      
      if (localPlayerSitting.isSitting && localPlayerSitting.sittingOn) {
        // Stand up
        socketRef.current?.emit("player_sit", {
          objectId: localPlayerSitting.sittingOn,
          action: 'stand',
        });
      } else {
        // Find nearest chair
      const nearestChair = findNearestInteractiveObject(
        localPlayerPos.x + PLAYER_WIDTH / 2,
        localPlayerPos.y + PLAYER_HEIGHT / 2,
        objects,
        50
      );

        if (nearestChair && nearestChair.type === 'chair') {
          socketRef.current?.emit("player_sit", {
            objectId: nearestChair.id,
            action: 'sit',
          });
        }
      }
    };

    window.addEventListener("keydown", handleSitKey);
    return () => window.removeEventListener("keydown", handleSitKey);
  }, [isConnected, localPlayerPos, localPlayerSitting, objects]);

  // Movement logic (disabled when sitting)
  useEffect(() => {
    if (!isConnected || localPlayerSitting.isSitting) return;

    const interval = setInterval(() => {
      let dx = 0;
      let dy = 0;

      // Arrow keys or WASD
      if (keys.has("arrowleft") || keys.has("a")) dx -= PLAYER_SPEED;
      if (keys.has("arrowright") || keys.has("d")) dx += PLAYER_SPEED;
      if (keys.has("arrowup") || keys.has("w")) dy -= PLAYER_SPEED;
      if (keys.has("arrowdown") || keys.has("s")) dy += PLAYER_SPEED;

      if (dx !== 0 || dy !== 0) {
        setLocalPlayerPos((prev) => {
          let newX = prev.x + dx;
          let newY = prev.y + dy;

          // Boundary check
          newX = clamp(newX, 0, 2000 - PLAYER_WIDTH);
          newY = clamp(newY, 0, 1500 - PLAYER_HEIGHT);

          // Collision check
          if (checkPlayerCollision(newX, newY, objects)) {
            // Try X movement only
            const newXOnly = clamp(prev.x + dx, 0, 2000 - PLAYER_WIDTH);
            if (!checkPlayerCollision(newXOnly, prev.y, objects)) {
              newX = newXOnly;
              newY = prev.y;
            } else {
              // Try Y movement only
              const newYOnly = clamp(prev.y + dy, 0, 1500 - PLAYER_HEIGHT);
              if (!checkPlayerCollision(prev.x, newYOnly, objects)) {
                newX = prev.x;
                newY = newYOnly;
              } else {
                // Can't move
                return prev;
              }
            }
          }

          return { x: newX, y: newY };
        });
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [keys, isConnected, objects, localPlayerSitting.isSitting]);

  // Send movement updates to server (throttled)
  useEffect(() => {
    if (!isConnected || !socketRef.current) return;

    const now = Date.now();
    if (now - lastMovementUpdateRef.current >= MOVEMENT_UPDATE_INTERVAL) {
      socketRef.current.emit("player_move", {
        x: localPlayerPos.x,
        y: localPlayerPos.y,
      });
      lastMovementUpdateRef.current = now;

      // Update local player in players map
      setPlayers((prev) => {
        const next = new Map(prev);
        const player = next.get(user.id) || { id: user.id, name: user.name, x: 0, y: 0 };
        player.x = localPlayerPos.x;
        player.y = localPlayerPos.y;
        next.set(user.id, player);
        return next;
      });
    }
  }, [localPlayerPos, isConnected, user.id, user.name]);

  // Update camera to follow local player
  useEffect(() => {
    setCamera({
      x: localPlayerPos.x - CANVAS_WIDTH / 2,
      y: localPlayerPos.y - CANVAS_HEIGHT / 2,
    });
  }, [localPlayerPos]);

  // Render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Apply camera transform
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    // Draw floor (simple colored background)
    ctx.fillStyle = "#e8e8e8";
    ctx.fillRect(0, 0, 2000, 1500);

    // Draw grid pattern (optional)
    ctx.strokeStyle = "#d0d0d0";
    ctx.lineWidth = 1;
    for (let x = 0; x <= 2000; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1500);
      ctx.stroke();
    }
    for (let y = 0; y <= 1500; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(2000, y);
      ctx.stroke();
    }

    // Draw office objects
    objects.forEach((obj) => {
      const sprite = sprites.get(obj.type === "desk" ? "desk" : obj.type === "chair" ? "chair" : "wall");
      
      if (sprite) {
        // Calculate aspect ratio to preserve sprite proportions
        const spriteAspect = sprite.width / sprite.height;
        const objAspect = obj.width / obj.height;
        
        let drawWidth = obj.width;
        let drawHeight = obj.height;
        let drawX = obj.x;
        let drawY = obj.y;
        
        if (spriteAspect > objAspect) {
          // Sprite is wider - fit to height and center horizontally
          drawHeight = obj.height;
          drawWidth = drawHeight * spriteAspect;
          drawX = obj.x + (obj.width - drawWidth) / 2;
        } else {
          // Sprite is taller - fit to width and center vertically
          drawWidth = obj.width;
          drawHeight = drawWidth / spriteAspect;
          drawY = obj.y + (obj.height - drawHeight) / 2;
        }
        
        ctx.drawImage(sprite, drawX, drawY, drawWidth, drawHeight);
      } else {
        // Fallback: draw colored rectangles
        ctx.fillStyle = obj.type === "desk" ? "#8b5a3c" : obj.type === "chair" ? "#654321" : "#999";
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        ctx.strokeStyle = "#666";
        ctx.lineWidth = 2;
        ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
      }
    });

    // Draw players
    players.forEach((player) => {
      const color = getPlayerColor(player.id);
      const sprite = sprites.get("player");
      const isSitting = player.isSitting || false;

      if (sprite) {
        ctx.drawImage(sprite, player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
      } else {
        // Fallback: draw colored circle (smaller when sitting)
        ctx.fillStyle = color;
        ctx.beginPath();
        const radius = isSitting ? PLAYER_WIDTH / 3 : PLAYER_WIDTH / 2;
        const centerY = isSitting ? player.y + PLAYER_HEIGHT / 2 + 5 : player.y + PLAYER_HEIGHT / 2;
        ctx.arc(player.x + PLAYER_WIDTH / 2, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw player name
      ctx.fillStyle = "#000";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      const nameY = isSitting ? player.y - 10 : player.y - 5;
      ctx.fillText(player.name, player.x + PLAYER_WIDTH / 2, nameY);
    });

    // Draw chat bubbles
    chatMessages.forEach((msg, playerId) => {
      const player = players.get(playerId);
      if (!player) return;

      const bubbleX = player.x + PLAYER_WIDTH / 2;
      const bubbleY = player.y - 40;

      // Measure text
      ctx.font = "14px sans-serif";
      ctx.textAlign = "left";
      const textMetrics = ctx.measureText(msg.message);
      const bubbleWidth = Math.max(textMetrics.width + 20, 80);
      const bubbleHeight = 30;

      // Draw bubble background
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      roundRect(ctx, bubbleX - bubbleWidth / 2, bubbleY - bubbleHeight, bubbleWidth, bubbleHeight, 8);
      ctx.fill();
      ctx.stroke();

      // Draw text
      ctx.fillStyle = "#000";
      ctx.fillText(msg.message, bubbleX - bubbleWidth / 2 + 10, bubbleY - bubbleHeight / 2 + 5);
    });

    ctx.restore();

    animationFrameRef.current = requestAnimationFrame(render);
  }, [camera, objects, players, chatMessages, sprites]);

  // Start render loop
  useEffect(() => {
    if (!spritesLoaded) return;

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render, spritesLoaded]);

  // Helper function to draw rounded rectangles
  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  // Handle chat input
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChatInput.trim() || !socketRef.current?.connected) return;

    socketRef.current.emit("player_chat", {
      message: currentChatInput.trim().substring(0, 100),
    });
    setCurrentChatInput("");
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Connecting to office...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-background flex flex-col">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-full"
        style={{ display: "block" }}
      />

      {/* Chat Input */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4">
        <form onSubmit={handleSendChat} className="flex gap-2">
          <input
            type="text"
            value={currentChatInput}
            onChange={(e) => setCurrentChatInput(e.target.value)}
            placeholder="Type a message... (Enter to send)"
            className="flex-1 px-4 py-2 rounded-md border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            maxLength={100}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={!currentChatInput.trim()}
          >
            Send
          </button>
        </form>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm border rounded-lg p-3 text-sm">
        <p className="font-semibold mb-1">Controls:</p>
        <p>WASD or Arrow Keys to move</p>
        <p>E to sit/stand on chairs</p>
        <p>Type to chat</p>
      </div>

      {/* Player count */}
      <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm border rounded-lg p-3 text-sm">
        <p>
          Players: <span className="font-semibold">{players.size}</span>
        </p>
      </div>
    </div>
  );
}

