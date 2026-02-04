import { Flame, Trophy, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "./TaskCard";
import { useMemo } from "react";

interface StudyStreakProps {
  tasks: Task[];
}

export function StudyStreak({ tasks }: StudyStreakProps) {
  const stats = useMemo(() => {
    const completedTasks = tasks.filter((t) => t.done);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate streak
    let streak = 0;
    let currentDate = new Date(today);
    
    // Check today first
    const todayStr = currentDate.toISOString().split("T")[0];
    const hasTodayCompleted = completedTasks.some((t) => t.date === todayStr);
    
    if (hasTodayCompleted) {
      streak = 1;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    // Check previous days
    while (true) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const hasCompletedTask = completedTasks.some((t) => t.date === dateStr);
      if (hasCompletedTask) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate weekly progress
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyCompleted = completedTasks.filter((t) => {
      const taskDate = new Date(t.date);
      return taskDate >= weekAgo && taskDate <= today;
    }).length;

    // Calculate total completion rate
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 
      ? Math.round((completedTasks.length / totalTasks) * 100) 
      : 0;

    return {
      streak,
      weeklyCompleted,
      totalCompleted: completedTasks.length,
      completionRate,
    };
  }, [tasks]);

  const streakLevel = stats.streak >= 7 ? "legendary" : stats.streak >= 3 ? "hot" : "normal";

  return (
    <div className="glass-card rounded-2xl p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Progresso
        </span>
      </div>

      {/* Streak Card */}
      <div className={cn(
        "relative rounded-xl p-4 overflow-hidden transition-all duration-500",
        "bg-gradient-to-br",
        streakLevel === "legendary" && "from-amber-500/20 to-orange-500/10 border border-amber-500/30",
        streakLevel === "hot" && "from-orange-500/15 to-red-500/10 border border-orange-500/20",
        streakLevel === "normal" && "from-secondary/80 to-secondary/40 border border-border/50"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              streakLevel === "legendary" && "bg-amber-500/20 animate-glow-pulse",
              streakLevel === "hot" && "bg-orange-500/20",
              streakLevel === "normal" && "bg-muted"
            )}>
              <Flame className={cn(
                "h-5 w-5",
                streakLevel === "legendary" && "text-amber-400",
                streakLevel === "hot" && "text-orange-400",
                streakLevel === "normal" && "text-muted-foreground"
              )} />
            </div>
            <div>
              <p className="text-2xl font-black">{stats.streak}</p>
              <p className="text-xs text-muted-foreground">dias seguidos</p>
            </div>
          </div>
          {streakLevel === "legendary" && (
            <div className="animate-bounce-subtle">
              <Trophy className="h-6 w-6 text-amber-400" />
            </div>
          )}
        </div>

        {/* Streak visual indicator */}
        <div className="flex gap-1 mt-3">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-300",
                i < stats.streak 
                  ? streakLevel === "legendary" 
                    ? "bg-amber-400" 
                    : streakLevel === "hot" 
                      ? "bg-orange-400" 
                      : "bg-primary"
                  : "bg-muted"
              )}
              style={{ transitionDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-subtle rounded-xl p-3 group hover:bg-secondary/60 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-3.5 w-3.5 text-primary/70 group-hover:text-primary transition-colors" />
            <span className="text-xs text-muted-foreground">Semana</span>
          </div>
          <p className="text-lg font-bold">{stats.weeklyCompleted}</p>
        </div>
        
        <div className="glass-subtle rounded-xl p-3 group hover:bg-secondary/60 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-3.5 w-3.5 text-primary/70 group-hover:text-primary transition-colors" />
            <span className="text-xs text-muted-foreground">Taxa</span>
          </div>
          <p className="text-lg font-bold">{stats.completionRate}%</p>
        </div>
      </div>
    </div>
  );
}
