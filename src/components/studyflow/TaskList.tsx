import { CalendarDays } from "lucide-react";
import { TaskCard, Task } from "./TaskCard";
import { Badge } from "@/components/ui/badge";

interface TaskListProps {
  tasks: Task[];
  selectedDate: Date;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskList({ tasks, selectedDate, onToggle, onDelete }: TaskListProps) {
  const selectedDateStr = selectedDate.toISOString().split("T")[0];
  const todayStr = new Date().toISOString().split("T")[0];
  const isToday = selectedDateStr === todayStr;
  
  const filteredTasks = tasks.filter((t) => t.date === selectedDateStr);

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", { 
      weekday: "long", 
      day: "numeric", 
      month: "long" 
    });
  };

  const displayTitle = isToday 
    ? `Tarefas de hoje` 
    : `Tarefas de ${formatDisplayDate(selectedDate)}`;

  return (
    <div className="bg-card/50 border border-border rounded-xl p-6 flex-1">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold capitalize">{displayTitle}</h2>
        </div>
        <Badge variant="secondary" className="text-xs">
          {filteredTasks.length} tarefas
        </Badge>
      </div>

      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground font-medium">Nenhuma tarefa para hoje</p>
            <p className="text-muted-foreground/70 text-sm mt-1">
              Adicione novas matérias para começar!
            </p>
          </div>
        ) : (
          filteredTasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
