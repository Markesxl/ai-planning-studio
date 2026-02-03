import { Bot, Timer, Zap } from "lucide-react";
import { Calendar } from "./Calendar";
import { CategoryProgress } from "./CategoryProgress";
import { PomodoroTimer } from "./PomodoroTimer";
import { Task } from "./TaskCard";

interface SidebarProps {
  tasks: Task[];
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  onDeleteCategory?: (category: string) => void;
  onPomodoroComplete?: () => void;
}

export function Sidebar({ tasks, selectedDate, onSelectDate, onDeleteCategory, onPomodoroComplete }: SidebarProps) {
  const taskDates = tasks
    .filter((t) => t.date)
    .map((t) => t.date as string);

  return (
    <aside className="w-80 glass border-r border-border/50 p-6 flex flex-col gap-6 flex-shrink-0 overflow-y-auto relative">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10 flex flex-col gap-6">
        {/* Brand */}
        <div className="flex items-center gap-4 group">
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-105">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black leading-tight tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              VDE AI
            </h2>
            <p className="text-xs font-bold text-primary flex items-center gap-1">
              <Zap className="h-3 w-3" />
              GENESIS
            </p>
          </div>
        </div>

        {/* Calendar */}
        <div className="glass-card rounded-2xl p-4 glass-card-hover">
          <Calendar
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            taskDates={taskDates}
          />
        </div>

        {/* Pomodoro Timer */}
        <div className="glass-card rounded-2xl p-5 glass-card-hover relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <Timer className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Modo Foco
              </span>
            </div>
            <PomodoroTimer onComplete={onPomodoroComplete} />
          </div>
        </div>

        {/* Category Progress */}
        <div className="flex-1 glass-card rounded-2xl p-4 glass-card-hover">
          <CategoryProgress
            tasks={tasks}
            onDeleteCategory={onDeleteCategory || (() => {})}
          />
        </div>
      </div>
    </aside>
  );
}
