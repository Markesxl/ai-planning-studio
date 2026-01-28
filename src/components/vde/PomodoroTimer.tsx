import { useState, useEffect, useRef } from "react";
import { Play, Square, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PomodoroTimerProps {
  duration?: number; // in minutes
  onComplete?: () => void;
}

export function PomodoroTimer({ duration = 25, onComplete }: PomodoroTimerProps) {
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
            // Request notification
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

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Timer Display */}
      <div className="relative">
        <div
          className={cn(
            "text-5xl font-black text-primary tracking-wider transition-all duration-300",
            isRunning && "animate-pulse-glow"
          )}
        >
          {formatTime(seconds)}
        </div>
        {/* Progress bar */}
        <div className="mt-4 h-1 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <Button
          onClick={toggleTimer}
          className={cn(
            "w-full font-bold uppercase transition-all duration-300",
            isRunning
              ? "bg-destructive hover:bg-destructive/90 glow-danger"
              : "bg-primary hover:bg-primary/90 glow-primary"
          )}
        >
          {isRunning ? (
            <>
              <Square className="h-4 w-4 mr-2" />
              Parar
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Iniciar Foco
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={resetTimer}
          className="border-border hover:bg-secondary"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
