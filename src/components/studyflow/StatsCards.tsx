import { CheckCircle, Clock, Zap, Trophy } from "lucide-react";
import { Task } from "./TaskCard";

interface StatsCardsProps {
  tasks: Task[];
  pomodoroCount: number;
}

export function StatsCards({ tasks, pomodoroCount }: StatsCardsProps) {
  const completedTasks = tasks.filter(t => t.done).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Estimate hours (25 min pomodoro per task)
  const estimatedHours = Math.round((completedTasks * 25) / 60);

  const stats = [
    {
      icon: CheckCircle,
      value: completedTasks,
      label: "Concluídos",
      colorClass: "text-stat-orange",
      bgClass: "bg-stat-orange/20",
      borderClass: "border-stat-orange/30",
    },
    {
      icon: Clock,
      value: estimatedHours,
      label: "Horas Est.",
      colorClass: "text-stat-blue",
      bgClass: "bg-stat-blue/20",
      borderClass: "border-stat-blue/30",
    },
    {
      icon: Zap,
      value: pomodoroCount,
      label: "Pomodoros",
      colorClass: "text-stat-yellow",
      bgClass: "bg-stat-yellow/20",
      borderClass: "border-stat-yellow/30",
    },
    {
      icon: Trophy,
      value: `${progressPercentage}%`,
      label: "Progresso",
      colorClass: "text-stat-purple",
      bgClass: "bg-stat-purple/20",
      borderClass: "border-stat-purple/30",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bgClass} ${stat.borderClass} border rounded-xl p-4 transition-all duration-300 hover:scale-[1.02]`}
        >
          <stat.icon className={`h-5 w-5 ${stat.colorClass} mb-3`} />
          <div className={`text-2xl font-bold ${stat.colorClass}`}>{stat.value}</div>
          <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
