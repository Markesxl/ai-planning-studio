import { Bot, Zap, X } from "lucide-react";
import { Calendar } from "./Calendar";
import { CategoryProgress } from "./CategoryProgress";
import { ThemeToggle } from "./ThemeToggle";
import { Task } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface SidebarProps {
  tasks: Task[];
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  onDeleteCategory?: (category: string) => void;
  onClose?: () => void;
}

export function Sidebar({ 
  tasks, 
  selectedDate, 
  onSelectDate, 
  onDeleteCategory, 
  onClose 
}: SidebarProps) {
  const taskDates = tasks
    .filter((t) => t.date)
    .map((t) => t.date as string);
  const isMobile = useIsMobile();

  return (
    <aside className={cn(
      "glass border-r border-border/50 flex flex-col gap-4 flex-shrink-0 overflow-y-auto relative",
      "w-[85vw] max-w-[320px] md:w-72 lg:w-80",
      "p-4 md:p-5",
      "h-screen"
    )}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10 flex flex-col gap-4 md:gap-5">
        {/* Brand & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="p-2 md:p-2.5 rounded-xl md:rounded-2xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-105">
              <Bot className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black leading-tight tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                VDE AI
              </h2>
              <p className="text-[9px] md:text-[10px] font-bold text-primary flex items-center gap-1">
                <Zap className="h-2 w-2 md:h-2.5 md:w-2.5" />
                GENESIS
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Theme Toggle - Always visible */}
            <ThemeToggle />
            
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
        </div>

        {/* Calendar */}
        <div className="glass-card rounded-xl md:rounded-2xl p-3 glass-card-hover animate-scale-in">
          <Calendar
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            taskDates={taskDates}
          />
        </div>

        {/* Category Progress */}
        <div className="flex-1 glass-card rounded-xl md:rounded-2xl p-3 md:p-4 glass-card-hover animate-scale-in" style={{ animationDelay: "0.1s" }}>
          <CategoryProgress
            tasks={tasks}
            onDeleteCategory={onDeleteCategory || (() => {})}
          />
        </div>
      </div>
    </aside>
  );
}
