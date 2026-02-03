import { Trash2, TrendingUp, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Task } from "./TaskCard";
import { cn } from "@/lib/utils";

interface CategoryProgressProps {
  tasks: Task[];
  onDeleteCategory: (category: string) => void;
}

interface CategoryData {
  name: string;
  total: number;
  completed: number;
  percentage: number;
}

export function CategoryProgress({ tasks, onDeleteCategory }: CategoryProgressProps) {
  const categories = tasks.reduce<Record<string, CategoryData>>((acc, task) => {
    const category = task.category || "Sem categoria";
    if (!acc[category]) {
      acc[category] = { name: category, total: 0, completed: 0, percentage: 0 };
    }
    acc[category].total += 1;
    if (task.done) {
      acc[category].completed += 1;
    }
    return acc;
  }, {});

  const categoryList = Object.values(categories).map((cat) => ({
    ...cat,
    percentage: cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0,
  }));

  if (categoryList.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
          <BookOpen className="h-5 w-5 text-primary/50" />
        </div>
        <p className="text-sm text-muted-foreground">
          Nenhuma matéria criada ainda
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Progresso por Matéria
        </span>
      </div>

      <div className="space-y-3">
        {categoryList.map((category) => (
          <div
            key={category.name}
            className={cn(
              "group glass-subtle rounded-xl p-3",
              "transition-all duration-300",
              "hover:bg-card/50"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium truncate flex-1">
                {category.name}
              </span>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-md",
                  category.percentage === 100 
                    ? "bg-primary/20 text-primary" 
                    : "bg-secondary text-muted-foreground"
                )}>
                  {category.percentage}%
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-6 w-6 rounded-lg opacity-0 group-hover:opacity-100",
                        "transition-all duration-200",
                        "text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                      )}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass-card border-border/50">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover matéria?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Isso irá remover "{category.name}" e todas as suas{" "}
                        {category.total} tarefas. Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDeleteCategory(category.name)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                      >
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <Progress 
              value={category.percentage} 
              className="h-1.5 bg-secondary/50" 
            />
            <p className="text-xs text-muted-foreground/80 mt-1.5">
              {category.completed} de {category.total} concluídas
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
