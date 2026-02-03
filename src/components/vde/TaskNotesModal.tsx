import { useState, useEffect } from "react";
import { StickyNote, GraduationCap, BookOpen, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Task } from "./TaskCard";
import { cn } from "@/lib/utils";

interface TaskNotesModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveNotes: (taskId: string, notes: string) => void;
}

export function TaskNotesModal({ task, open, onOpenChange, onSaveNotes }: TaskNotesModalProps) {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (task) {
      setNotes(task.notes || "");
    }
  }, [task]);

  const handleSave = () => {
    if (task) {
      onSaveNotes(task.id, notes);
      onOpenChange(false);
    }
  };

  if (!task) return null;

  const priorityLabels = {
    high: { label: "Alta Prioridade", color: "text-destructive" },
    medium: { label: "Média Prioridade", color: "text-yellow-500" },
    low: { label: "Baixa Prioridade", color: "text-primary" },
  };

  const priority = priorityLabels[task.priority || "low"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-primary" />
            Detalhes da Tarefa
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* Task Info */}
          <div className="space-y-3 p-4 bg-secondary/50 rounded-lg">
            {/* Course */}
            {task.category && (
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">{task.category}</span>
              </div>
            )}
            
            {/* Subject */}
            {task.subject && (
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{task.subject}</span>
              </div>
            )}

            {/* Description */}
            <div className="pt-2 border-t border-border">
              <p className={cn("text-sm", task.done && "line-through opacity-50")}>
                {task.description || task.text}
              </p>
            </div>

            {/* Priority & Date */}
            <div className="flex items-center justify-between text-xs pt-2">
              <span className={cn("font-medium", priority.color)}>
                {priority.label}
              </span>
              {task.date && (
                <span className="text-muted-foreground">
                  {new Date(task.date + "T00:00:00").toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <StickyNote className="h-4 w-4" />
              Anotações
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Suas anotações sobre esta tarefa..."
              className="bg-background border-border focus:border-primary transition-colors min-h-[150px] resize-none"
            />
          </div>

          {/* Save Button */}
          <Button onClick={handleSave} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Salvar Anotações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
