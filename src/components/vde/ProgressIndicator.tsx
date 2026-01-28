import { TrendingUp } from "lucide-react";

interface ProgressIndicatorProps {
  completed: number;
  total: number;
}

export function ProgressIndicator({ completed, total }: ProgressIndicatorProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
        <TrendingUp className="h-4 w-4" />
        Eficiência IA
      </div>
      <div className="text-4xl font-black text-primary">
        {percentage}%
      </div>
      <div className="h-2 bg-background rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {completed} de {total} tarefas concluídas
      </p>
    </div>
  );
}
