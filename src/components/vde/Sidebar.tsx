import { Bot, Timer } from "lucide-react";
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
    <aside className="w-80 bg-sidebar border-r border-sidebar-border p-6 flex flex-col gap-6 flex-shrink-0 overflow-y-auto">
      {/* Brand */}
      <div className="flex items-center gap-4 text-primary">
        <Bot className="h-10 w-10" />
        <div>
          <h2 className="text-2xl font-black leading-tight tracking-tight">
            VDE AI
          </h2>
          <p className="text-xs font-bold text-primary/70">GENESIS</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="space-y-4">
        <Calendar
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          taskDates={taskDates}
        />
      </div>

      {/* Pomodoro Timer */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
          <Timer className="h-4 w-4" />
          Modo Foco
        </div>
        <PomodoroTimer onComplete={onPomodoroComplete} />
      </div>

      {/* Category Progress */}
      <div className="flex-1">
        <CategoryProgress
          tasks={tasks}
          onDeleteCategory={onDeleteCategory || (() => {})}
        />
      </div>
    </aside>
  );
}
