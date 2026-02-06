import { forwardRef } from "react";
import { motion } from "framer-motion";
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

interface CategoryColor {
  border: string;
  bg: string;
  text: string;
}

interface TaskCardProps {
  task: Task;
  index: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (task: Task) => void;
  categoryColor?: CategoryColor;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(
  ({ task, index, onToggle, onDelete, onClick, categoryColor }, ref) => {
    // Default colors based on priority (fallback if no category color)
    const priorityGlows = {
      high: "hover:shadow-[0_0_30px_hsl(4_70%_45%/0.15)]",
      medium: "hover:shadow-[0_0_30px_hsl(45_100%_50%/0.15)]",
      low: "hover:shadow-[0_0_30px_hsl(145_63%_49%/0.15)]",
    };

    const priority = task.priority || "low";
    const borderClass = categoryColor?.border || "border-l-primary";
    const badgeBg = categoryColor?.bg || "bg-primary/10";
    const badgeText = categoryColor?.text || "text-primary";

    const handleClick = (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('[role="checkbox"]')) {
        return;
      }
      onClick?.(task);
    };

    return (
      <motion.div
        ref={ref}
        onClick={handleClick}
        className={cn(
          "group glass-subtle rounded-xl md:rounded-2xl p-3 md:p-4 flex items-start gap-3 md:gap-4",
          "border-l-4 cursor-pointer",
          "transition-all duration-300",
          "hover:bg-card/60",
          borderClass,
          priorityGlows[priority]
        )}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Checkbox */}
        <div className="pt-0.5">
          <motion.div whileTap={{ scale: 0.9 }}>
            <Checkbox
              checked={task.done}
              onCheckedChange={() => onToggle(task.id)}
              className={cn(
                "h-4 w-4 md:h-5 md:w-5 rounded-md md:rounded-lg border-2 transition-all duration-300",
                "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
                "hover:border-primary/60 focus-ring-animated"
              )}
            />
          </motion.div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5 md:space-y-2">
          {/* Category & Subject badges */}
          {(task.category || task.subject) && (
            <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
              {task.category && (
                <motion.span 
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 md:px-2.5 md:py-1 rounded-md md:rounded-lg text-[10px] md:text-xs font-semibold border border-current/20",
                    badgeBg,
                    badgeText
                  )}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <BookOpen className="h-2.5 w-2.5 md:h-3 md:w-3" />
                  {task.category}
                </motion.span>
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
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 1, scale: 1 }}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(task.id)}
            className={cn(
              "transition-all duration-200",
              "text-destructive/70 hover:text-destructive hover:bg-destructive/10",
              "rounded-lg md:rounded-xl h-7 w-7 md:h-8 md:w-8"
            )}
          >
            <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </Button>
        </motion.div>
      </motion.div>
    );
  }
);

TaskCard.displayName = "TaskCard";
