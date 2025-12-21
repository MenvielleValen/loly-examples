import { useEffect, useState } from "react";
import { useRouter } from "@lolyjs/core/hooks";
import { Button } from "@/components/ui/button";
import { GameBoard } from "@/components/game/GameBoard";
import { PlayerInfo } from "@/components/game/PlayerInfo";
import { WinnerAnimation } from "@/components/game/WinnerAnimation";
import { useGameSocket } from "@/lib/game-socket";
import { Gamepad2, RotateCcw, Home, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

type GamePageProps = {
  params: { roomId: string };
  user: {
    id: string;
    name: string;
  };
};

export default function GamePage({ params, user }: GamePageProps) {
  const router = useRouter();
  const { roomId } = params;
  const currentUserId = user?.id || null;
  
  const {
    isConnected,
    room,
    error,
    makeMove,
    leaveRoom,
    getGameState,
    resetGame,
  } = useGameSocket();

  const [showWinnerAnimation, setShowWinnerAnimation] = useState(false);

  // Get game state on mount and when roomId changes
  useEffect(() => {
    if (isConnected && roomId) {
      getGameState(roomId);
    }
  }, [isConnected, roomId, getGameState]);

  // Redirect to lobby if room doesn't exist
  useEffect(() => {
    if (error && error.includes("not found")) {
      setTimeout(() => {
        router.push("/lobby");
      }, 2000);
    }
  }, [error, router]);

  // Show winner animation when game finishes
  useEffect(() => {
    if (room && room.status === "finished" && room.winner && room.winner !== "draw") {
      const winnerPlayer = room.players.find((p) => p.symbol === room.winner);
      if (winnerPlayer) {
        setShowWinnerAnimation(true);
      }
    }
  }, [room?.status, room?.winner, room?.players]);

  const handleCellClick = (position: number) => {
    if (!room || !currentUserId) return;

    // Check if it's current user's turn
    const currentPlayer = room.players.find((p) => p.id === currentUserId);
    if (!currentPlayer) return;

    if (room.currentPlayer !== currentPlayer.symbol) return;
    if (room.status !== "playing") return;

    makeMove(roomId, position);
  };

  const handleReset = () => {
    if (roomId) {
      resetGame(roomId);
    }
  };

  const handleLeave = () => {
    if (roomId) {
      leaveRoom(roomId);
    }
    router.push("/lobby");
  };

  const handleLogout = () => {
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/");
  };

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/90 to-primary shadow-lg shadow-primary/20 mb-4">
            <Gamepad2 className="h-8 w-8 text-primary-foreground animate-pulse" />
          </div>
          <p className="text-muted-foreground">Connecting...</p>
        </div>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/90 to-primary shadow-lg shadow-primary/20 mb-4">
            <Gamepad2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">Loading game...</p>
          {error && (
            <p className="text-destructive text-sm mb-4">{error}</p>
          )}
          <Button onClick={() => router.push("/lobby")} variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Back to Lobby
          </Button>
        </div>
      </main>
    );
  }

    // Verify that the current user is actually a player in this room
  const currentPlayer = room.players.find((p) => p.id === currentUserId);
  if (!currentPlayer && currentUserId) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-destructive/90 to-destructive shadow-lg shadow-destructive/20 mb-4">
            <Gamepad2 className="h-8 w-8 text-destructive-foreground" />
          </div>
          <p className="text-foreground mb-2 font-semibold">Access Denied</p>
          <p className="text-muted-foreground mb-4 text-sm">
            You are not a player in this game room.
          </p>
          <Button onClick={() => router.push("/lobby")} variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Back to Lobby
          </Button>
        </div>
      </main>
    );
  }

  const isMyTurn = currentPlayer && room.currentPlayer === currentPlayer.symbol && room.status === "playing";
  const isGameFinished = room.status === "finished";
  
  // Get winner info for animation
  const winnerPlayer = room.winner && room.winner !== "draw" 
    ? room.players.find((p) => p.symbol === room.winner)
    : null;

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Winner Animation */}
      {showWinnerAnimation && winnerPlayer && room.winner !== "draw" && room.winner && (
        <WinnerAnimation 
          winner={room.winner} 
          winnerName={winnerPlayer.name}
          onClose={() => setShowWinnerAnimation(false)}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-accent/10 to-transparent opacity-60" />
      
      <div className="relative container mx-auto px-6 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/90 to-primary shadow-lg shadow-primary/20">
              <Gamepad2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Tic Tac Toe
              </h1>
              <p className="text-xs text-muted-foreground">Room: {roomId.slice(0, 8)}...</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                isConnected ? "bg-green-500" : "bg-red-500"
              )}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-center">
            {error}
          </div>
        )}

        {/* Player Info */}
        <div className="mb-6">
          <PlayerInfo
            players={room.players}
            currentPlayer={room.currentPlayer}
            winner={room.winner}
            status={room.status}
            currentUserId={currentUserId}
          />
        </div>

        {/* Game Board */}
        <div className="mb-6">
          <GameBoard
            board={room.board}
            currentPlayer={room.currentPlayer}
            onCellClick={handleCellClick}
            disabled={!isMyTurn || isGameFinished}
            winner={room.winner}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isGameFinished && (
            <Button
              onClick={handleReset}
              size="lg"
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              New Game
            </Button>
          )}
          <Button
            onClick={handleLeave}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Lobby
          </Button>
        </div>
      </div>
    </main>
  );
}

