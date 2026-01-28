import { Bot } from "lucide-react";
import { Calendar } from "./Calendar";
import { ProgressIndicator } from "./ProgressIndicator";
import { Task } from "./TaskCard";

interface SidebarProps {
  tasks: Task[];
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
}

export function Sidebar({ tasks, selectedDate, onSelectDate }: SidebarProps) {
  const completedTasks = tasks.filter((t) => t.done).length;
  const taskDates = tasks
    .filter((t) => t.date)
    .map((t) => t.date as string);

  return (
    <aside className="w-80 bg-sidebar border-r border-sidebar-border p-6 flex flex-col gap-8 flex-shrink-0">
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

      {/* Progress - pushed to bottom */}
      <div className="mt-auto">
        <ProgressIndicator completed={completedTasks} total={tasks.length} />
      </div>
    </aside>
  );
}
