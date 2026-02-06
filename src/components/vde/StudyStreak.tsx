import { motion } from "framer-motion";
import { Flame, Trophy, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "./TaskCard";
import { AnimatedCounter } from "./AnimatedCounter";

interface Progress {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  weeklyCompleted: number;
  completionRate: number;
  lastStudyDate: string | null;
}

interface StudyStreakProps {
  tasks: Task[];
  progress?: Progress;
  compact?: boolean;
}

export function StudyStreak({ tasks, progress, compact = false }: StudyStreakProps) {
  // Use progress from props or calculate locally
  const stats = progress || {
    currentStreak: 0,
    longestStreak: 0,
    totalCompleted: tasks.filter((t) => t.done).length,
    weeklyCompleted: 0,
    completionRate: tasks.length > 0 
      ? Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100) 
      : 0,
    lastStudyDate: null,
  };

  const streakLevel = stats.currentStreak >= 7 ? "legendary" : stats.currentStreak >= 3 ? "hot" : "normal";

  // Compact version for mobile
  if (compact) {
    return (
      <motion.div 
        className="glass-card rounded-xl p-3 glass-card-hover"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1 rounded-lg bg-primary/10 border border-primary/20">
            <TrendingUp className="h-3 w-3 text-primary" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            Progresso
          </span>
        </div>

        {/* Streak Display */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <motion.div 
              className={cn(
                "p-1.5 rounded-lg",
                streakLevel === "legendary" && "bg-amber-500/20",
                streakLevel === "hot" && "bg-orange-500/20",
                streakLevel === "normal" && "bg-muted"
              )}
              animate={streakLevel === "legendary" ? { 
                scale: [1, 1.1, 1],
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Flame className={cn(
                "h-3.5 w-3.5",
                streakLevel === "legendary" && "text-amber-400",
                streakLevel === "hot" && "text-orange-400",
                streakLevel === "normal" && "text-muted-foreground"
              )} />
            </motion.div>
            <div>
              <p className="text-lg font-black leading-none">
                <AnimatedCounter value={stats.currentStreak} />
              </p>
              <p className="text-[9px] text-muted-foreground">dias</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-black leading-none text-primary">
              <AnimatedCounter value={stats.completionRate} suffix="%" />
            </p>
            <p className="text-[9px] text-muted-foreground">taxa</p>
          </div>
        </div>

        {/* Streak visual indicator */}
        <div className="flex gap-0.5">
          {[...Array(7)].map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full",
                i < stats.currentStreak 
                  ? streakLevel === "legendary" 
                    ? "bg-amber-400" 
                    : streakLevel === "hot" 
                      ? "bg-orange-400" 
                      : "bg-primary"
                  : "bg-muted"
              )}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  // Full version for desktop
  return (
    <motion.div 
      className="glass-card rounded-2xl p-4 space-y-4 glass-card-hover"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Progresso
        </span>
      </div>

      {/* Streak Card */}
      <motion.div 
        className={cn(
          "relative rounded-xl p-4 overflow-hidden transition-all duration-500",
          "bg-gradient-to-br",
          streakLevel === "legendary" && "from-amber-500/20 to-orange-500/10 border border-amber-500/30",
          streakLevel === "hot" && "from-orange-500/15 to-red-500/10 border border-orange-500/20",
          streakLevel === "normal" && "from-secondary/80 to-secondary/40 border border-border/50"
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              className={cn(
                "p-2 rounded-lg",
                streakLevel === "legendary" && "bg-amber-500/20",
                streakLevel === "hot" && "bg-orange-500/20",
                streakLevel === "normal" && "bg-muted"
              )}
              animate={streakLevel === "legendary" ? { 
                scale: [1, 1.15, 1],
                opacity: [0.8, 1, 0.8],
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Flame className={cn(
                "h-5 w-5",
                streakLevel === "legendary" && "text-amber-400",
                streakLevel === "hot" && "text-orange-400",
                streakLevel === "normal" && "text-muted-foreground"
              )} />
            </motion.div>
            <div>
              <p className="text-2xl font-black">
                <AnimatedCounter value={stats.currentStreak} />
              </p>
              <p className="text-xs text-muted-foreground">dias seguidos</p>
            </div>
          </div>
          {streakLevel === "legendary" && (
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Trophy className="h-6 w-6 text-amber-400" />
            </motion.div>
          )}
        </div>

        {/* Streak visual indicator */}
        <div className="flex gap-1 mt-3">
          {[...Array(7)].map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                i < stats.currentStreak 
                  ? streakLevel === "legendary" 
                    ? "bg-amber-400" 
                    : streakLevel === "hot" 
                      ? "bg-orange-400" 
                      : "bg-primary"
                  : "bg-muted"
              )}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.3 }}
            />
          ))}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div 
          className="glass-subtle rounded-xl p-3 group hover:bg-secondary/60 transition-colors"
          whileHover={{ scale: 1.05 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-3.5 w-3.5 text-primary/70 group-hover:text-primary transition-colors" />
            <span className="text-xs text-muted-foreground">Semana</span>
          </div>
          <p className="text-lg font-bold">
            <AnimatedCounter value={stats.weeklyCompleted} />
          </p>
        </motion.div>
        
        <motion.div 
          className="glass-subtle rounded-xl p-3 group hover:bg-secondary/60 transition-colors"
          whileHover={{ scale: 1.05 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-3.5 w-3.5 text-primary/70 group-hover:text-primary transition-colors" />
            <span className="text-xs text-muted-foreground">Taxa</span>
          </div>
          <p className="text-lg font-bold">
            <AnimatedCounter value={stats.completionRate} suffix="%" />
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
