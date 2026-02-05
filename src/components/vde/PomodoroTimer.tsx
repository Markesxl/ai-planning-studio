import { useState, useEffect, useRef } from "react";
import { Play, Square, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PomodoroTimerProps {
  duration?: number;
  onComplete?: () => void;
  compact?: boolean;
}

export function PomodoroTimer({ duration = 25, onComplete, compact = false }: PomodoroTimerProps) {
  const [seconds, setSeconds] = useState(duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            onComplete?.();
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("VDE AI", { body: "Sessão Pomodoro concluída! 🎉" });
            }
            return duration * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, seconds, duration, onComplete]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(duration * 60);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const progress = ((duration * 60 - seconds) / (duration * 60)) * 100;

  // Compact version for mobile
  if (compact) {
    return (
      <div className="flex flex-col items-center gap-2">
        {/* Timer Display */}
        <div className="relative">
          {isRunning && (
            <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full animate-glow-pulse" />
          )}
          <div
            className={cn(
              "relative text-xl font-black tracking-wider transition-all duration-500",
              isRunning ? "text-primary scale-105" : "text-foreground"
            )}
          >
            {formatTime(seconds)}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-secondary/50 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000 ease-linear",
              isRunning 
                ? "bg-gradient-to-r from-primary via-emerald-400 to-primary bg-[length:200%_100%] animate-shimmer" 
                : "bg-primary"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex gap-1.5 w-full">
          <Button
            onClick={toggleTimer}
            size="sm"
            className={cn(
              "flex-1 font-bold uppercase text-[10px] rounded-lg h-7 transition-all duration-300",
              isRunning
                ? "bg-destructive/90 hover:bg-destructive text-destructive-foreground"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            )}
          >
            {isRunning ? (
              <Square className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetTimer}
            className="h-7 w-7 rounded-lg border-border/50 p-0"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  // Full version for desktop
  return (
    <div className="flex flex-col items-center gap-4 md:gap-5">
      {/* Timer Display */}
      <div className="relative">
        {/* Glow effect when running */}
        {isRunning && (
          <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full animate-glow-pulse" />
        )}
        
        <div
          className={cn(
            "relative text-4xl md:text-5xl font-black tracking-wider transition-all duration-500",
            isRunning ? "text-primary scale-105" : "text-foreground"
          )}
        >
          {formatTime(seconds)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 md:h-1.5 bg-secondary/50 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-linear",
            isRunning 
              ? "bg-gradient-to-r from-primary via-emerald-400 to-primary bg-[length:200%_100%] animate-shimmer" 
              : "bg-primary"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex gap-2 md:gap-3 w-full">
        <Button
          onClick={toggleTimer}
          className={cn(
            "flex-1 font-bold uppercase text-xs md:text-sm rounded-lg md:rounded-xl h-9 md:h-11 transition-all duration-300 micro-press",
            isRunning
              ? "bg-destructive/90 hover:bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20"
              : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
          )}
        >
          {isRunning ? (
            <>
              <Square className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
              Parar
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
              Iniciar
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={resetTimer}
          className="h-9 w-9 md:h-11 md:w-11 rounded-lg md:rounded-xl border-border/50 hover:bg-secondary/50 hover:border-primary/30 micro-bounce"
        >
          <RotateCcw className="h-3.5 w-3.5 md:h-4 md:w-4" />
        </Button>
      </div>
    </div>
  );
}
