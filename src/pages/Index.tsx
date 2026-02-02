import { useState, useEffect, useCallback } from "react";
import { Bot, CalendarDays, Timer } from "lucide-react";
import { Sidebar } from "@/components/vde/Sidebar";
import { AIPlanner } from "@/components/vde/AIPlanner";
import { PomodoroTimer } from "@/components/vde/PomodoroTimer";
import { TaskCard, Task } from "@/components/vde/TaskCard";
import { NotesArea } from "@/components/vde/NotesArea";
import { FeedbackOverlay } from "@/components/vde/FeedbackOverlay";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "vde_v4_data";

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
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
        // Handle migration from old format
        if (Array.isArray(parsed)) {
          setTasks(parsed);
        } else if (parsed.tasks) {
          setTasks(parsed.tasks);
        } else if (parsed.today || parsed.weekly) {
          // Migrate from old format
          setTasks([...(parsed.today || []), ...(parsed.weekly || [])]);
        }
      } catch {
        console.error("Failed to parse saved tasks");
      }
    }

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Save tasks to localStorage
  const saveTasks = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
  }, []);

  // Handle AI-generated tasks
  const handleTasksGenerated = useCallback(
    (aiTasks: { text: string; priority: string; date?: string; category?: string }[]) => {
      const newTasks: Task[] = aiTasks.map((t, i) => ({
        id: `${Date.now()}-${i}`,
        text: t.text,
        done: false,
        priority: (t.priority as "high" | "medium" | "low") || "medium",
        date: t.date || new Date().toISOString().split("T")[0],
        category: t.category || "Geral",
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

  // Toggle task completion
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

  // Delete task
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

  // Delete all tasks in a category
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

  // Pomodoro complete handler
  const handlePomodoroComplete = useCallback(() => {
    setFeedback({
      show: true,
      type: "complete",
      message: "Pomodoro Concluído! 🏆",
    });
  }, []);

  // Get selected date string for filtering
  const selectedDateStr = selectedDate.toISOString().split("T")[0];
  const todayStr = new Date().toISOString().split("T")[0];
  const isToday = selectedDateStr === todayStr;
  
  // Filter tasks for selected date
  const filteredTasks = tasks.filter((t) => t.date === selectedDateStr);
  
  // Format selected date for display
  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", { 
      weekday: "long", 
      day: "numeric", 
      month: "long" 
    });
  };

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      {/* Feedback Overlay */}
      <FeedbackOverlay
        show={feedback.show}
        type={feedback.type}
        message={feedback.message}
        onHide={() => setFeedback((prev) => ({ ...prev, show: false }))}
      />

      {/* Sidebar */}
      <Sidebar
        tasks={tasks}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onDeleteCategory={deleteCategory}
      />

      {/* Main Content */}
      <main className="flex-1 flex gap-6 p-8 overflow-hidden">
        {/* Column 1: AI Planner + Pomodoro */}
        <div className="flex-1 flex flex-col gap-6 min-w-0 overflow-y-auto pr-2">
          {/* Title Card */}
          <div className="bg-card border border-border rounded-2xl p-6 border-l-4 border-l-primary bg-gradient-to-r from-secondary to-card">
            <div className="flex items-center gap-3 text-primary mb-2">
              <Bot className="h-6 w-6" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Assistente Inteligente
              </span>
            </div>
            <h1 className="text-3xl font-black">🤖 Planejamento AI</h1>
          </div>

          {/* AI Planner Card */}
          <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary hover:shadow-lg transition-all duration-300">
            <AIPlanner onTasksGenerated={handleTasksGenerated} />
          </div>

          {/* Pomodoro Card */}
          <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-6">
              <Timer className="h-4 w-4" />
              Pomodoro Timer
            </div>
            <PomodoroTimer onComplete={handlePomodoroComplete} />
          </div>
        </div>

        {/* Column 2: Today's Tasks + Notes */}
        <div className="flex-1 flex flex-col gap-6 min-w-0 overflow-y-auto pr-2">
          {/* Selected Date Tasks */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
              <CalendarDays className="h-4 w-4" />
              {isToday ? "Tarefas de Hoje" : formatDisplayDate(selectedDate)}
            </div>
            <div className="space-y-3">
              {filteredTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 text-sm">
                  {isToday 
                    ? "Nenhuma tarefa para hoje. Use a IA para gerar!" 
                    : "Nenhuma tarefa para esta data."}
                </p>
              ) : (
                filteredTasks.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={index}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                  />
                ))
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <NotesArea />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
