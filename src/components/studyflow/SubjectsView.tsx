import { BookOpen, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task } from "./TaskCard";
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

interface SubjectsViewProps {
  tasks: Task[];
  onNewSubject: () => void;
  onDeleteCategory: (category: string) => void;
}

export function SubjectsView({ tasks, onNewSubject, onDeleteCategory }: SubjectsViewProps) {
  // Group tasks by category
  const categories = tasks.reduce((acc, task) => {
    const cat = task.category || "Sem categoria";
    if (!acc[cat]) {
      acc[cat] = { total: 0, done: 0 };
    }
    acc[cat].total++;
    if (task.done) acc[cat].done++;
    return acc;
  }, {} as Record<string, { total: number; done: number }>);

  const categoryList = Object.entries(categories);

  return (
    <div className="flex-1 space-y-4">
      {/* Header */}
      <div className="bg-card/50 border border-border rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-primary">Minhas Matérias</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Gerencie suas matérias e acompanhe o progresso
            </p>
          </div>
          <Button 
            onClick={onNewSubject}
            className="bg-primary hover:bg-primary/90 gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Matéria
          </Button>
        </div>
      </div>

      {/* Subjects List */}
      <div className="bg-card/50 border border-border rounded-xl p-6 min-h-[400px]">
        {categoryList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Nenhuma matéria cadastrada</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Adicione sua primeira matéria para começar a estudar!
            </p>
            <Button 
              onClick={onNewSubject}
              variant="outline"
              className="gap-2 border-primary/50 text-primary hover:bg-primary/10"
            >
              <Plus className="h-4 w-4" />
              Criar Primeira Matéria
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {categoryList.map(([category, stats]) => {
              const progress = Math.round((stats.done / stats.total) * 100);
              return (
                <div
                  key={category}
                  className="group flex items-center gap-4 p-4 bg-secondary/30 border border-border/50 rounded-xl hover:bg-secondary/50 transition-all"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{category}</h3>
                      <span className="text-xs text-muted-foreground">
                        {stats.done}/{stats.total} tarefas
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover matéria</AlertDialogTitle>
                        <AlertDialogDescription>
                          Isso removerá "{category}" e todas as suas {stats.total} tarefas. Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDeleteCategory(category)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
