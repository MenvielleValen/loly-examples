import { useEffect, useRef, useState } from "react";
import { lolySocket } from "@lolyjs/core/sockets";
import type { Socket } from "socket.io-client";
import type { Player, ChatMessage, OfficeObject } from "@/lib/office/types";

interface OfficeCanvasProps {
  user: { id: string; name: string };
}

export function OfficeCanvas({ user }: OfficeCanvasProps) {
  const phaserContainerRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<any>(null); // PhaserGame type, loaded dynamically
  const socketRef = useRef<Socket | null>(null);

  // Game state
  const [players, setPlayers] = useState<Map<string, Player>>(new Map());
  const [chatMessages, setChatMessages] = useState<Map<string, ChatMessage>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [phaserReady, setPhaserReady] = useState(false);

  // Local player state
  const [localPlayerSitting, setLocalPlayerSitting] = useState<{ isSitting: boolean; sittingOn?: string }>({ isSitting: false });
  const [currentChatInput, setCurrentChatInput] = useState("");

  // Initialize Phaser (client-side only)
  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;
    if (phaserGameRef.current) return;

    // Wait for container to be available
    const initPhaser = async () => {
      // Wait for container element to exist
      let container = document.getElementById("phaser-container");
      if (!container) {
        // Retry after a short delay
        setTimeout(initPhaser, 50);
        return;
      }

      try {
        console.log("Initializing Phaser...");
        // Dynamic import to avoid SSR
        const { PhaserGame } = await import("@/lib/phaser/PhaserGame");
        const game = new PhaserGame();
        phaserGameRef.current = game;
        await game.init("phaser-container");
        console.log("Phaser initialized, waiting for scene...");

        // Wait for scene to be ready
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max
        const checkScene = setInterval(() => {
          attempts++;
          const scene = game.getScene();
          if (scene && scene.scene?.isActive()) {
            console.log("Phaser scene is ready!");
            setPhaserReady(true);
            clearInterval(checkScene);
          } else if (attempts >= maxAttempts) {
            console.warn("Phaser scene did not become ready in time");
            clearInterval(checkScene);
          }
        }, 100);
      } catch (error) {
        console.error("Failed to load Phaser:", error);
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(initPhaser, 100);

    return () => {
      clearTimeout(timeoutId);
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy();
        phaserGameRef.current = null;
      }
    };
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

      // Initialize Phaser scene with players (wait for scene AND assets to be ready)
      const initPhaser = () => {
        const scene = phaserGameRef.current?.getScene();
        if (scene && phaserReady) {
          // Check if textures are loaded
          const texturesReady = scene.textures && 
            scene.textures.exists("luis-walk") && 
            scene.textures.exists("sofia-walk");
          
          if (texturesReady) {
            scene.setOfficeObjects(data.objects);
            data.players.forEach((player) => {
              scene.addPlayer(player, player.id === user.id);
            });
          } else {
            // Retry after a short delay if textures not ready
            setTimeout(initPhaser, 100);
          }
        } else if (!phaserReady) {
          // Retry after a short delay
          setTimeout(initPhaser, 100);
        }
      };
      initPhaser();
    });

    ws.on("player_joined", (data: { player: Player }) => {
      setPlayers((prev) => {
        const next = new Map(prev);
        next.set(data.player.id, data.player);
        return next;
      });

      // Add player to Phaser scene
      const scene = phaserGameRef.current?.getScene();
      if (scene && phaserReady) {
        scene.addPlayer(data.player, data.player.id === user.id);
      }
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

      // Remove player from Phaser scene
      const scene = phaserGameRef.current?.getScene();
      if (scene && phaserReady) {
        scene.removePlayer(data.playerId);
      }
    });

    ws.on("player_move", (data: { playerId: string; x: number; y: number; animation?: string }) => {
      if (data.playerId === user.id) return; // Skip local player updates (Phaser handles it)

      // Update player position in state and Phaser
      setPlayers((prev) => {
        const next = new Map(prev);
        const player = next.get(data.playerId);
        if (player) {
          player.x = data.x;
          player.y = data.y;
          if (data.animation) {
            player.animation = data.animation;
          }
          next.set(data.playerId, player);

          // Update player position in Phaser
          const scene = phaserGameRef.current?.getScene();
          if (scene && phaserReady) {
            scene.updatePlayer(player);
          }
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

      // Show chat bubble in Phaser
      const scene = phaserGameRef.current?.getScene();
      if (scene && phaserReady) {
        scene.showChatBubble(data.playerId, data);
      }
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

          // Update player in Phaser
          const scene = phaserGameRef.current?.getScene();
          if (scene && phaserReady) {
            scene.updatePlayer(player);
          }
        }
        return next;
      });

      // Update local player state if it's us
      if (data.playerId === user.id) {
        setLocalPlayerSitting({
          isSitting: data.action === 'sit',
          sittingOn: data.action === 'sit' ? data.objectId : undefined,
        });
      }
    });

    ws.on("__loly:error", (error: { code: string; message: string }) => {
      console.error("WebSocket error:", error.code, error.message);
    });

    return () => {
      ws.close();
    };
  }, [user.id, phaserReady]);

  // Setup Phaser scene callbacks
  useEffect(() => {
    if (!phaserReady || !isConnected || !socketRef.current) return;

    const scene = phaserGameRef.current?.getScene();
    if (!scene) return;

    // Set local player ID
    scene.setLocalPlayerId(user.id);

    // Setup movement callback
    scene.setMovementCallback((x: number, y: number, animation?: string) => {
      if (socketRef.current?.connected && !localPlayerSitting.isSitting) {
        socketRef.current.emit("player_move", { x, y, animation });

        // Update local player in state
        setPlayers((prev) => {
          const next = new Map(prev);
          const player = next.get(user.id) || { id: user.id, name: user.name, x, y };
          player.x = x;
          player.y = y;
          if (animation) {
            player.animation = animation;
          }
          next.set(user.id, player);
          return next;
        });
      }
    });

    // Setup sit callback
    scene.setSitCallback((objectId: string, action: 'sit' | 'stand') => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("player_sit", { objectId, action });
      }
    });
  }, [phaserReady, isConnected, user.id, localPlayerSitting.isSitting]);

  // Handle input focus to disable Phaser keyboard (like reference project)
  useEffect(() => {
    const isInputElement = (target: HTMLElement) =>
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.contentEditable === "true";

    // Enable or disable Phaser keyboard handling
    const togglePhaserKeyboard = (enabled: boolean) => {
      const scene = phaserGameRef.current?.getScene();
      if (scene?.input?.keyboard) {
        scene.input.keyboard.manager.enabled = enabled;
      }
    };

    // Listener for when input is focused
    const handleFocusIn = (event: FocusEvent) => {
      if (isInputElement(event.target as HTMLElement)) {
        togglePhaserKeyboard(false);
      }
    };

    // Listener for when input is unfocused
    const handleFocusOut = () => {
      setTimeout(() => {
        const activeElement = document.activeElement as HTMLElement;
        const inputFocused = activeElement && isInputElement(activeElement);
        togglePhaserKeyboard(!inputFocused);
      }, 10);
    };

    // Listener for click on canvas
    const handleCanvasClick = (event: MouseEvent) => {
      if ((event.target as HTMLElement).tagName === "CANVAS") {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && isInputElement(activeElement)) {
          activeElement.blur();
        }
      }
    };

    document.addEventListener("focusin", handleFocusIn, true);
    document.addEventListener("focusout", handleFocusOut, true);
    const gameContainer = document.getElementById("phaser-container");
    gameContainer?.addEventListener("click", handleCanvasClick);

    return () => {
      document.removeEventListener("focusin", handleFocusIn, true);
      document.removeEventListener("focusout", handleFocusOut, true);
      gameContainer?.removeEventListener("click", handleCanvasClick);
    };
  }, [phaserReady]);


  // Handle chat input
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChatInput.trim() || !socketRef.current?.connected) return;

    socketRef.current.emit("player_chat", {
      message: currentChatInput.trim().substring(0, 100),
    });
    setCurrentChatInput("");
    
    // Blur the input after sending
    const input = e.currentTarget.querySelector('input') as HTMLInputElement;
    if (input) {
      input.blur();
    }
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
      {/* Phaser Container */}
      <div
        id="phaser-container"
        ref={phaserContainerRef}
        className="w-full h-full"
        style={{ minHeight: "100vh", backgroundColor: "#e8e8e8" }}
      />
      {!phaserReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Loading Phaser...</p>
          </div>
        </div>
      )}

      {/* Chat Input - positioned above the banner */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4">
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
        <p className="mt-1 text-xs">
          Phaser: <span className={phaserReady ? "text-green-500" : "text-yellow-500"}>{phaserReady ? "Ready" : "Loading..."}</span>
        </p>
      </div>
    </div>
  );
}

