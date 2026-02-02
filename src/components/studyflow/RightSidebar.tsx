import { useState, useEffect, useRef } from "react";
import { CalendarIcon, ChevronLeft, ChevronRight, Play, RotateCcw, Target, Coffee, Armchair, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const DAY_NAMES = ["D", "S", "T", "Q", "Q", "S", "S"];

interface RightSidebarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  taskDates: string[];
  onPomodoroComplete: () => void;
}

export function RightSidebar({ selectedDate, onSelectDate, taskDates, onPomodoroComplete }: RightSidebarProps) {
  const [viewDate, setViewDate] = useState(new Date());
  const today = new Date();

  // Pomodoro state
  const [focusTime, setFocusTime] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(15);
  const [cycles, setCycles] = useState(0);
  const [currentMode, setCurrentMode] = useState<"focus" | "short" | "long">("focus");
  const [seconds, setSeconds] = useState(focusTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const changeMonth = (delta: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setViewDate(newDate);
  };

  const isToday = (day: number) => {
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
  };

  const isSelected = (day: number) => {
    return day === selectedDate.getDate() && 
           month === selectedDate.getMonth() && 
           year === selectedDate.getFullYear();
  };

  const hasTask = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return taskDates.includes(dateStr);
  };

  const handleDayClick = (day: number) => {
    onSelectDate(new Date(year, month, day));
  };

  // Generate calendar grid
  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];
  
  for (let i = 0; i < firstDayOfMonth; i++) {
    currentWeek.push(null);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  // Pomodoro timer logic
  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (currentMode === "focus") {
              setCycles(c => c + 1);
              onPomodoroComplete();
            }
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("StudyFlow AI", { body: "Sessão concluída! 🎉" });
            }
            return getCurrentTime() * 60;
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
  }, [isRunning, seconds, currentMode]);

  const getCurrentTime = () => {
    switch (currentMode) {
      case "focus": return focusTime;
      case "short": return shortBreak;
      case "long": return longBreak;
    }
  };

  const switchMode = (mode: "focus" | "short" | "long") => {
    setCurrentMode(mode);
    setIsRunning(false);
    switch (mode) {
      case "focus": setSeconds(focusTime * 60); break;
      case "short": setSeconds(shortBreak * 60); break;
      case "long": setSeconds(longBreak * 60); break;
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(getCurrentTime() * 60);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return { mins: String(mins).padStart(2, "0"), secs: String(secs).padStart(2, "0") };
  };

  const time = formatTime(seconds);

  return (
    <aside className="w-80 flex-shrink-0 space-y-4 overflow-y-auto">
      {/* Calendar */}
      <div className="bg-card/50 border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-sm">Calendário</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => changeMonth(-1)}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {MONTH_NAMES[month]} De {year}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => changeMonth(1)}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <table className="w-full border-collapse text-center text-xs">
          <thead>
            <tr>
              {DAY_NAMES.map((day, i) => (
                <th key={i} className={cn(
                  "py-2 font-medium",
                  i === 0 ? "text-primary" : "text-muted-foreground"
                )}>
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, weekIndex) => (
              <tr key={weekIndex}>
                {week.map((day, dayIndex) => (
                  <td
                    key={dayIndex}
                    onClick={() => day && handleDayClick(day)}
                    className={cn(
                      "py-1.5 relative cursor-pointer rounded-lg transition-all duration-200 text-sm",
                      day && "hover:bg-primary/20",
                      day && isToday(day) && "bg-primary text-primary-foreground font-bold",
                      day && isSelected(day) && !isToday(day) && "bg-primary/30 text-primary font-medium",
                      day && hasTask(day) && !isToday(day) && !isSelected(day) && "text-primary",
                      !day && "cursor-default"
                    )}
                  >
                    {day}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <p className="text-xs text-muted-foreground text-center mt-3">
          Clique em um dia para ver as tarefas
        </p>
      </div>

      {/* Pomodoro Timer */}
      <div className="bg-card/50 border border-border rounded-xl p-4">
        <div className="text-center mb-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            MODO FOCO
          </span>
        </div>

        {/* Timer Display */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const modes: ("focus" | "short" | "long")[] = ["focus", "short", "long"];
              const currentIndex = modes.indexOf(currentMode);
              const prevIndex = (currentIndex - 1 + modes.length) % modes.length;
              switchMode(modes[prevIndex]);
            }}
            className="h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className={cn(
            "text-5xl font-bold tracking-wider transition-all",
            isRunning && "text-primary"
          )}>
            <span>{time.mins}</span>
            <span className="text-muted-foreground">:</span>
            <span className="text-muted-foreground">{time.secs}</span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const modes: ("focus" | "short" | "long")[] = ["focus", "short", "long"];
              const currentIndex = modes.indexOf(currentMode);
              const nextIndex = (currentIndex + 1) % modes.length;
              switchMode(modes[nextIndex]);
            }}
            className="h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-2 mb-6">
          <Button
            onClick={toggleTimer}
            className={cn(
              "gap-2 font-medium",
              isRunning ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
            )}
          >
            <Play className="h-4 w-4" />
            {isRunning ? "Pausar" : "Iniciar"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={resetTimer}
            className="border-border"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Settings */}
        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>Foco:</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">{focusTime}</span>
              <div className="flex flex-col">
                <button 
                  onClick={() => setFocusTime(Math.min(60, focusTime + 5))}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >▲</button>
                <button 
                  onClick={() => setFocusTime(Math.max(5, focusTime - 5))}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >▼</button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Coffee className="h-4 w-4" />
              <span>Pausa Curta:</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">{shortBreak}</span>
              <div className="flex flex-col">
                <button 
                  onClick={() => setShortBreak(Math.min(15, shortBreak + 1))}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >▲</button>
                <button 
                  onClick={() => setShortBreak(Math.max(1, shortBreak - 1))}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >▼</button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Armchair className="h-4 w-4" />
              <span>Pausa Longa:</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">{longBreak}</span>
              <div className="flex flex-col">
                <button 
                  onClick={() => setLongBreak(Math.min(30, longBreak + 5))}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >▲</button>
                <button 
                  onClick={() => setLongBreak(Math.max(5, longBreak - 5))}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >▼</button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>Ciclos:</span>
            </div>
            <span className="text-lg font-bold text-primary">{cycles}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
