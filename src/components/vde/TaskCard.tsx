import { forwardRef } from "react";
import { Trash2, CalendarDays, BookOpen } from "lucide-react";
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
  subject?: string;
  description?: string;
  notes?: string;
}

interface TaskCardProps {
  task: Task;
  index: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (task: Task) => void;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(
  ({ task, index, onToggle, onDelete, onClick }, ref) => {
    const priorityStyles = {
      high: {
        border: "border-l-destructive",
        glow: "hover:shadow-[0_0_30px_hsl(4_70%_45%/0.15)]",
        badge: "bg-destructive/10 text-destructive border-destructive/20",
      },
      medium: {
        border: "border-l-amber-500",
        glow: "hover:shadow-[0_0_30px_hsl(45_100%_50%/0.15)]",
        badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      },
      low: {
        border: "border-l-primary",
        glow: "hover:shadow-[0_0_30px_hsl(145_63%_49%/0.15)]",
        badge: "bg-primary/10 text-primary border-primary/20",
      },
    };

    const priority = task.priority || "low";
    const styles = priorityStyles[priority];

    const handleClick = (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('[role="checkbox"]')) {
        return;
      }
      onClick?.(task);
    };

    return (
      <div
        ref={ref}
        onClick={handleClick}
        className={cn(
          "group glass-subtle rounded-xl md:rounded-2xl p-3 md:p-4 flex items-start gap-3 md:gap-4",
          "border-l-4 cursor-pointer animate-card-entrance",
          "transition-all duration-300 micro-press",
          "hover:bg-card/60 hover:scale-[1.01]",
          "active:scale-[0.99]",
          styles.border,
          styles.glow
        )}
        style={{ animationDelay: `${index * 60}ms` }}
      >
        {/* Checkbox */}
        <div className="pt-0.5">
          <Checkbox
            checked={task.done}
            onCheckedChange={() => onToggle(task.id)}
            className={cn(
              "h-4 w-4 md:h-5 md:w-5 rounded-md md:rounded-lg border-2 transition-all duration-300",
              "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
              "hover:border-primary/60 focus-ring-animated"
            )}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5 md:space-y-2">
          {/* Category & Subject badges */}
          {(task.category || task.subject) && (
            <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
              {task.category && (
                <span className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 md:px-2.5 md:py-1 rounded-md md:rounded-lg text-[10px] md:text-xs font-semibold border",
                  styles.badge
                )}>
                  <BookOpen className="h-2.5 w-2.5 md:h-3 md:w-3" />
                  {task.category}
                </span>
              )}
              {task.subject && (
                <span className="px-2 py-0.5 md:px-2.5 md:py-1 rounded-md md:rounded-lg text-[10px] md:text-xs font-medium bg-secondary/50 text-muted-foreground border border-border/50">
                  {task.subject}
                </span>
              )}
            </div>
          )}

          {/* Description */}
          <p
            className={cn(
              "text-xs md:text-sm leading-relaxed transition-all duration-200",
              task.done && "line-through opacity-50"
            )}
          >
            {task.description || task.text}
          </p>

          {/* Date */}
          {task.date && (
            <span className="inline-flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs text-muted-foreground/80">
              <CalendarDays className="h-2.5 w-2.5 md:h-3 md:w-3" />
              {formatDate(task.date)}
            </span>
          )}
        </div>

        {/* Delete Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(task.id)}
          className={cn(
            "opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100",
            "transition-all duration-200 micro-bounce",
            "text-destructive/70 hover:text-destructive hover:bg-destructive/10",
            "rounded-lg md:rounded-xl h-7 w-7 md:h-8 md:w-8",
            // Always visible on mobile for touch
            "touch-device:opacity-100"
          )}
        >
          <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
        </Button>
      </div>
    );
  }
);

TaskCard.displayName = "TaskCard";
