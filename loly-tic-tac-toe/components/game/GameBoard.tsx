import { cn } from "@/lib/utils";
import type { Board, Player } from "@/lib/game-logic";
import { X, Circle } from "lucide-react";

interface GameBoardProps {
  board: Board;
  currentPlayer: "X" | "O";
  onCellClick: (position: number) => void;
  disabled?: boolean;
  winner: Player | "draw" | null;
}

export function GameBoard({
  board,
  currentPlayer,
  onCellClick,
  disabled = false,
  winner,
}: GameBoardProps) {
  const handleCellClick = (position: number) => {
    if (disabled || board[position] !== null || winner !== null) {
      return;
    }
    onCellClick(position);
  };

  const renderCell = (position: number) => {
    const value = board[position];
    const isClickable = !disabled && value === null && winner === null;

    return (
      <button
        key={position}
        onClick={() => handleCellClick(position)}
        disabled={!isClickable}
        className={cn(
          "game-cell aspect-square w-full rounded-lg border-2 border-border bg-background",
          "flex items-center justify-center",
          "hover:bg-accent/50 hover:border-primary/50",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-background disabled:hover:border-border",
          value && "cursor-default",
          !value && isClickable && "cursor-pointer",
          winner && "opacity-75"
        )}
        aria-label={value ? `Cell ${position + 1} contains ${value}` : `Empty cell ${position + 1}`}
      >
        {value === "X" && (
          <X className="h-12 w-12 text-primary dark:text-blue-400 stroke-[3] drop-shadow-lg dark:drop-shadow-[0_0_8px_rgba(96,165,250,0.6)] animate-in fade-in zoom-in duration-200" />
        )}
        {value === "O" && (
          <Circle className="h-12 w-12 text-secondary dark:text-orange-400 stroke-[3] drop-shadow-lg dark:drop-shadow-[0_0_8px_rgba(251,146,60,0.6)] animate-in fade-in zoom-in duration-200" />
        )}
        {!value && isClickable && (
          <span className="text-muted-foreground/20 text-2xl font-bold">
            {currentPlayer}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="grid grid-cols-3 gap-3 p-4 bg-card rounded-xl border border-border shadow-lg">
        {Array.from({ length: 9 }, (_, i) => renderCell(i))}
      </div>
    </div>
  );
}

