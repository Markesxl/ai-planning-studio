import { forwardRef } from "react";
import { Trash2, CalendarDays } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Task {
  id: string;
  text: string;
  done: boolean;
  priority?: "high" | "medium" | "low";
  date?: string;
  category?: string;
}

interface TaskCardProps {
  task: Task;
  index: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(
  ({ task, index, onToggle, onDelete }, ref) => {
    const priorityColors = {
      high: "border-l-destructive",
      medium: "border-l-yellow-500",
      low: "border-l-primary",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "group bg-card border border-border rounded-2xl p-4 flex items-center justify-between",
          "border-l-4 transition-all duration-300 animate-card-entrance",
          "hover:scale-[1.02] hover:translate-x-1 hover:border-primary hover:shadow-lg",
          priorityColors[task.priority || "low"]
        )}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Checkbox
            checked={task.done}
            onCheckedChange={() => onToggle(task.id)}
            className="h-5 w-5 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <div className="flex flex-col min-w-0 flex-1">
            <span
              className={cn(
                "text-sm transition-all duration-200 truncate",
                task.done && "line-through opacity-50"
              )}
            >
              {task.text}
            </span>
            {task.date && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <CalendarDays className="h-3 w-3" />
                {formatDate(task.date)}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }
);

TaskCard.displayName = "TaskCard";
