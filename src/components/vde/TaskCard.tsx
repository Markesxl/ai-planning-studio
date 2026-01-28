import { Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Task {
  id: string;
  text: string;
  done: boolean;
  priority?: "high" | "medium" | "low";
  date?: string;
}

interface TaskCardProps {
  task: Task;
  index: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, index, onToggle, onDelete }: TaskCardProps) {
  const priorityColors = {
    high: "border-l-destructive",
    medium: "border-l-yellow-500",
    low: "border-l-primary",
  };

  return (
    <div
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
        <span
          className={cn(
            "text-sm transition-all duration-200 truncate",
            task.done && "line-through opacity-50"
          )}
        >
          {task.text}
        </span>
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
