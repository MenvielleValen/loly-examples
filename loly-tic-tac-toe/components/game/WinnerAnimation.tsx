import { useState, useEffect } from "react";
import { Trophy, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface WinnerAnimationProps {
  winner: "X" | "O";
  winnerName: string;
  onClose?: () => void;
}

export function WinnerAnimation({ winner, winnerName, onClose }: WinnerAnimationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const isX = winner === "X";

  // Auto-hide after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose?.();
      }, 300); // Wait for fade-out animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClick = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300); // Wait for fade-out animation
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer"
      onClick={handleClick}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      
      <div 
        className={cn(
          "relative z-10 flex flex-col items-center justify-center space-y-6",
          isVisible ? "animate-in zoom-in-95 fade-in duration-500" : "animate-out zoom-out-95 fade-out duration-300"
        )}
      >
        {/* Trophy Icon */}
        <div
          className={cn(
            "relative flex items-center justify-center",
            "animate-bounce"
          )}
          style={{
            animation: "bounce 1s ease-in-out infinite, pulse 2s ease-in-out infinite",
          }}
        >
          <div
            className={cn(
              "absolute inset-0 rounded-full blur-2xl opacity-50",
              isX ? "bg-blue-500" : "bg-orange-500"
            )}
            style={{
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
          <div
            className={cn(
              "relative flex h-32 w-32 items-center justify-center rounded-full",
              "border-4 shadow-2xl",
              isX
                ? "border-blue-500 bg-blue-500/20 dark:bg-blue-500/10"
                : "border-orange-500 bg-orange-500/20 dark:bg-orange-500/10"
            )}
          >
            <Trophy
              className={cn(
                "h-16 w-16",
                isX ? "text-blue-500 dark:text-blue-400" : "text-orange-500 dark:text-orange-400"
              )}
            />
          </div>
        </div>

        {/* Winner Text */}
        <div className="text-center space-y-2">
          <h2
            className={cn(
              "text-4xl md:text-5xl font-bold tracking-tight",
              "animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300",
              isX ? "text-blue-500 dark:text-blue-400" : "text-orange-500 dark:text-orange-400"
            )}
          >
            {winnerName} Wins!
          </h2>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <p className="text-lg">Congratulations!</p>
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
        </div>

        {/* Animated particles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute h-2 w-2 rounded-full animate-ping",
                isX ? "bg-blue-500" : "bg-orange-500"
              )}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

