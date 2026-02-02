import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Task {
  id: string;
  text: string;
  done: boolean;
  priority: "high" | "medium" | "low";
  date?: string;
  category?: string;
}

interface TaskCardProps {
  task: Task;
  index: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const priorityStyles = {
  high: "border-l-destructive",
  medium: "border-l-yellow-500",
  low: "border-l-primary",
};

export function TaskCard({ task, index, onToggle, onDelete }: TaskCardProps) {
  return (
    <div
      className={cn(
        "group flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/50 border-l-4 transition-all duration-300 hover:bg-secondary/50",
        priorityStyles[task.priority],
        task.done && "opacity-60"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Checkbox
        checked={task.done}
        onCheckedChange={() => onToggle(task.id)}
        className="h-5 w-5 border-2 border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium transition-all duration-300",
            task.done && "line-through text-muted-foreground"
          )}
        >
          {task.text}
        </p>
        {task.category && (
          <span className="text-xs text-muted-foreground mt-1">
            {task.category}
          </span>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
