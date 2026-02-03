import { useState, useEffect, useCallback } from "react";
import { Bot, CalendarDays, Sparkles } from "lucide-react";
import { Sidebar } from "@/components/vde/Sidebar";
import { AddSubjectModal } from "@/components/vde/AddSubjectModal";
import { TaskNotesModal } from "@/components/vde/TaskNotesModal";
import { TaskCard, Task } from "@/components/vde/TaskCard";
import { FeedbackOverlay } from "@/components/vde/FeedbackOverlay";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "vde_v4_data";

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{
    show: boolean;
    type: "loading" | "success" | "error" | "complete";
    message: string;
  }>({ show: false, type: "loading", message: "" });

  // Load tasks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTasks(parsed);
        } else if (parsed.tasks) {
          setTasks(parsed.tasks);
        } else if (parsed.today || parsed.weekly) {
          setTasks([...(parsed.today || []), ...(parsed.weekly || [])]);
        }
      } catch {
        console.error("Failed to parse saved tasks");
      }
    }

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const saveTasks = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
  }, []);

  const handleTasksGenerated = useCallback(
    (aiTasks: { text: string; priority: string; date?: string; category?: string; subject?: string; description?: string }[]) => {
      const newTasks: Task[] = aiTasks.map((t, i) => ({
        id: `${Date.now()}-${i}`,
        text: t.text,
        done: false,
        priority: (t.priority as "high" | "medium" | "low") || "medium",
        date: t.date || new Date().toISOString().split("T")[0],
        category: t.category || "Geral",
        subject: t.subject,
        description: t.description || t.text,
      }));

      saveTasks([...tasks, ...newTasks]);

      setFeedback({
        show: true,
        type: "success",
        message: `✅ ${newTasks.length} tarefas criadas!`,
      });
    },
    [tasks, saveTasks]
  );

  const toggleTask = useCallback(
    (id: string) => {
      const updatedTasks = tasks.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      );
      saveTasks(updatedTasks);

      const task = updatedTasks.find((t) => t.id === id);
      if (task?.done) {
        setFeedback({
          show: true,
          type: "success",
          message: "Tarefa concluída! 🎉",
        });
      }
    },
    [tasks, saveTasks]
  );

  const deleteTask = useCallback(
    (id: string) => {
      const updatedTasks = tasks.filter((t) => t.id !== id);
      saveTasks(updatedTasks);
      toast({
        title: "Tarefa removida",
        description: "A tarefa foi excluída com sucesso.",
      });
    },
    [tasks, saveTasks]
  );

  const deleteCategory = useCallback(
    (category: string) => {
      const updatedTasks = tasks.filter((t) => (t.category || "Sem categoria") !== category);
      saveTasks(updatedTasks);
      toast({
        title: "Matéria removida",
        description: `Todas as tarefas de "${category}" foram excluídas.`,
      });
    },
    [tasks, saveTasks]
  );

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setNotesModalOpen(true);
  }, []);

  const handleSaveNotes = useCallback(
    (taskId: string, notes: string) => {
      const updatedTasks = tasks.map((t) =>
        t.id === taskId ? { ...t, notes } : t
      );
      saveTasks(updatedTasks);
      toast({
        title: "Anotações salvas",
        description: "Suas anotações foram salvas com sucesso.",
      });
    },
    [tasks, saveTasks]
  );

  const handlePomodoroComplete = useCallback(() => {
    setFeedback({
      show: true,
      type: "complete",
      message: "Pomodoro Concluído! 🏆",
    });
  }, []);

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

  return (
    <div className="flex min-h-screen bg-background overflow-hidden relative">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/3 rounded-full blur-[150px] animate-float" style={{ animationDelay: "-3s" }} />
      </div>

      {/* Feedback Overlay */}
      <FeedbackOverlay
        show={feedback.show}
        type={feedback.type}
        message={feedback.message}
        onHide={() => setFeedback((prev) => ({ ...prev, show: false }))}
      />

      {/* Task Notes Modal */}
      <TaskNotesModal
        task={selectedTask}
        open={notesModalOpen}
        onOpenChange={setNotesModalOpen}
        onSaveNotes={handleSaveNotes}
      />

      {/* Sidebar */}
      <Sidebar
        tasks={tasks}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onDeleteCategory={deleteCategory}
        onPomodoroComplete={handlePomodoroComplete}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-6 p-8 overflow-y-auto relative z-10">
        {/* Hero Card - AI Planner */}
        <div className="glass-card rounded-3xl p-8 glass-card-hover relative overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary/80">
                Assistente Inteligente
              </span>
            </div>
            
            <h1 className="text-3xl font-black mb-6 flex items-center gap-3">
              <Sparkles className="h-7 w-7 text-primary animate-pulse" />
              Planejamento AI
            </h1>
            
            <AddSubjectModal onTasksGenerated={handleTasksGenerated} />
          </div>
        </div>

        {/* Tasks Section */}
        <div className="glass-card rounded-3xl p-6 flex-1 glass-card-hover">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {isToday ? "Tarefas de Hoje" : formatDisplayDate(selectedDate)}
              </h2>
              <p className="text-xs text-muted-foreground">
                {filteredTasks.length} {filteredTasks.length === 1 ? "tarefa" : "tarefas"} programadas
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="glass-subtle rounded-2xl p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <CalendarDays className="h-8 w-8 text-primary/50" />
                </div>
                <p className="text-muted-foreground text-sm">
                  {isToday 
                    ? "Nenhuma tarefa para hoje. Use a IA para gerar!" 
                    : "Nenhuma tarefa para esta data."}
                </p>
              </div>
            ) : (
              filteredTasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  onClick={handleTaskClick}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
