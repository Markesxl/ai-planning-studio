import { Trash2 } from "lucide-react";
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
  // Group tasks by category
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

  // Calculate percentages
  const categoryList = Object.values(categories).map((cat) => ({
    ...cat,
    percentage: cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0,
  }));

  if (categoryList.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        Nenhuma matéria criada ainda
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
        Progresso por Matéria
      </div>
      <div className="space-y-3">
        {categoryList.map((category) => (
          <div
            key={category.name}
            className="group bg-background/50 rounded-xl p-3 border border-border hover:border-primary/50 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium truncate flex-1">
                {category.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary">
                  {category.percentage}%
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover matéria?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Isso irá remover "{category.name}" e todas as suas{" "}
                        {category.total} tarefas. Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDeleteCategory(category.name)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <Progress value={category.percentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {category.completed} de {category.total} concluídas
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
