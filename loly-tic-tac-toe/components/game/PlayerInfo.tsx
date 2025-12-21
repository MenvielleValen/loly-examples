import { cn } from "@/lib/utils";
import { X, Circle } from "lucide-react";

interface Player {
  id: string;
  name: string;
  symbol: "X" | "O";
}

interface PlayerInfoProps {
  players: Player[];
  currentPlayer: "X" | "O";
  winner: "X" | "O" | "draw" | null;
  status: "waiting" | "playing" | "finished";
  currentUserId?: string | null;
}

export function PlayerInfo({ players, currentPlayer, winner, status, currentUserId }: PlayerInfoProps) {
  const playerX = players.find((p) => p.symbol === "X");
  const playerO = players.find((p) => p.symbol === "O");
  const myPlayer = currentUserId ? players.find((p) => p.id === currentUserId) : null;
  const isMyTurn = myPlayer && currentPlayer === myPlayer.symbol && status === "playing";

  const getStatusText = () => {
    if (status === "waiting") {
      return "Waiting for opponent...";
    }
    if (status === "finished") {
      if (winner === "draw") {
        return "It's a draw!";
      }
      const winnerPlayer = winner === "X" ? playerX : playerO;
      return `${winnerPlayer?.name || winner} wins!`;
    }
    if (isMyTurn) {
      return "Your turn!";
    }
    return `Current turn: ${currentPlayer === "X" ? playerX?.name : playerO?.name}`;
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Player X */}
        <div
          className={cn(
            "p-4 rounded-lg border-2 transition-all",
            currentPlayer === "X" && status === "playing"
              ? "border-primary bg-primary/10 shadow-md player-active"
              : "border-border bg-card",
            winner === "X" && "border-primary bg-primary/20"
          )}
        >
          <div className="flex items-center gap-3 mb-2">
            <X className="h-6 w-6 text-primary dark:text-blue-400 stroke-[2.5]" />
            <span className="font-semibold text-sm text-muted-foreground">Player X</span>
          </div>
          <p className="text-lg font-bold text-foreground truncate">
            {playerX?.name || "Waiting..."}
          </p>
          {currentPlayer === "X" && status === "playing" && (
            <p className="text-xs text-primary mt-1">Your turn</p>
          )}
        </div>

        {/* Player O */}
        <div
          className={cn(
            "p-4 rounded-lg border-2 transition-all",
            currentPlayer === "O" && status === "playing"
              ? "border-secondary bg-secondary/10 shadow-md player-active"
              : "border-border bg-card",
            winner === "O" && "border-secondary bg-secondary/20"
          )}
        >
          <div className="flex items-center gap-3 mb-2">
            <Circle className="h-6 w-6 text-secondary dark:text-orange-400 stroke-[2.5]" />
            <span className="font-semibold text-sm text-muted-foreground">Player O</span>
          </div>
          <p className="text-lg font-bold text-foreground truncate">
            {playerO?.name || "Waiting..."}
          </p>
          {currentPlayer === "O" && status === "playing" && (
            <p className="text-xs text-secondary mt-1">Your turn</p>
          )}
        </div>
      </div>

      {/* Status text */}
      <div className="text-center">
        <p
          className={cn(
            "text-sm font-medium",
            status === "finished" && winner !== "draw"
              ? "text-primary"
              : status === "finished" && winner === "draw"
              ? "text-muted-foreground"
              : "text-muted-foreground"
          )}
        >
          {getStatusText()}
        </p>
      </div>
    </div>
  );
}

