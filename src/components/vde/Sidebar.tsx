import { Bot, Timer, Zap, X } from "lucide-react";
import { Calendar } from "./Calendar";
import { CategoryProgress } from "./CategoryProgress";
import { PomodoroTimer } from "./PomodoroTimer";
import { StudyStreak } from "./StudyStreak";
import { Task } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface SidebarProps {
  tasks: Task[];
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  onDeleteCategory?: (category: string) => void;
  onPomodoroComplete?: () => void;
  onClose?: () => void;
}

export function Sidebar({ 
  tasks, 
  selectedDate, 
  onSelectDate, 
  onDeleteCategory, 
  onPomodoroComplete,
  onClose 
}: SidebarProps) {
  const taskDates = tasks
    .filter((t) => t.date)
    .map((t) => t.date as string);
  const isMobile = useIsMobile();

  return (
    <aside className={cn(
      "glass border-r border-border/50 flex flex-col gap-4 flex-shrink-0 overflow-y-auto relative",
      "w-[85vw] max-w-[320px] md:w-80",
      "p-4 md:p-6",
      "h-screen"
    )}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10 flex flex-col gap-4 md:gap-6">
        {/* Brand & Close Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4 group">
            <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-105">
              <Bot className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black leading-tight tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                VDE AI
              </h2>
              <p className="text-[10px] md:text-xs font-bold text-primary flex items-center gap-1">
                <Zap className="h-2.5 w-2.5 md:h-3 md:w-3" />
                GENESIS
              </p>
            </div>
          </div>
          
          {isMobile && onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 rounded-xl glass-subtle micro-bounce"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Calendar */}
        <div className="glass-card rounded-xl md:rounded-2xl p-3 md:p-4 glass-card-hover animate-scale-in">
          <Calendar
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            taskDates={taskDates}
          />
        </div>

        {/* Study Streak - Desktop Only */}
        {!isMobile && (
          <div className="animate-scale-in" style={{ animationDelay: "0.05s" }}>
            <StudyStreak tasks={tasks} />
          </div>
        )}

        {/* Pomodoro Timer */}
        <div className="glass-card rounded-xl md:rounded-2xl p-4 md:p-5 glass-card-hover relative overflow-hidden animate-scale-in" style={{ animationDelay: "0.1s" }}>
          {/* Decorative element */}
          <div className="absolute -top-8 -right-8 w-20 md:w-24 h-20 md:h-24 bg-primary/10 rounded-full blur-2xl" />
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <div className="p-1 md:p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <Timer className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
              </div>
              <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Modo Foco
              </span>
            </div>
            <PomodoroTimer onComplete={onPomodoroComplete} />
          </div>
        </div>

        {/* Category Progress */}
        <div className="flex-1 glass-card rounded-xl md:rounded-2xl p-3 md:p-4 glass-card-hover animate-scale-in" style={{ animationDelay: "0.15s" }}>
          <CategoryProgress
            tasks={tasks}
            onDeleteCategory={onDeleteCategory || (() => {})}
          />
        </div>
      </div>
    </aside>
  );
}
