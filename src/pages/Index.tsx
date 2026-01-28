import { useState, useEffect, useCallback } from "react";
import { Bot, ListChecks, CalendarDays, Timer } from "lucide-react";
import { Sidebar } from "@/components/vde/Sidebar";
import { AIPlanner } from "@/components/vde/AIPlanner";
import { PomodoroTimer } from "@/components/vde/PomodoroTimer";
import { TaskCard, Task } from "@/components/vde/TaskCard";
import { NotesArea } from "@/components/vde/NotesArea";
import { FeedbackOverlay } from "@/components/vde/FeedbackOverlay";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "vde_v3_data";

interface TaskData {
  today: Task[];
  weekly: Task[];
}

const Index = () => {
  const [tasks, setTasks] = useState<TaskData>({ today: [], weekly: [] });
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
        setTasks(parsed);
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
  const saveTasks = useCallback((newTasks: TaskData) => {
    setTasks(newTasks);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
  }, []);

  // Handle AI-generated tasks
  const handleTasksGenerated = useCallback(
    (aiTasks: { text: string; priority: string }[]) => {
      const newTasks: Task[] = aiTasks.map((t, i) => ({
        id: `${Date.now()}-${i}`,
        text: t.text,
        done: false,
        priority: (t.priority as "high" | "medium" | "low") || "medium",
        date: new Date().toISOString().split("T")[0],
      }));

      saveTasks({
        ...tasks,
        weekly: [...tasks.weekly, ...newTasks],
      });

      setFeedback({
        show: true,
        type: "success",
        message: `✅ ${newTasks.length} tarefas geradas!`,
      });
    },
    [tasks, saveTasks]
  );

  // Toggle task completion
  const toggleTask = useCallback(
    (type: "today" | "weekly", id: string) => {
      const updatedTasks = tasks[type].map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      );
      saveTasks({ ...tasks, [type]: updatedTasks });

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
    (type: "today" | "weekly", id: string) => {
      const updatedTasks = tasks[type].filter((t) => t.id !== id);
      saveTasks({ ...tasks, [type]: updatedTasks });
      toast({
        title: "Tarefa removida",
        description: "A tarefa foi excluída com sucesso.",
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

  const allTasks = [...tasks.today, ...tasks.weekly];

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
        tasks={allTasks}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
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

        {/* Column 2: Weekly Tasks */}
        <div className="flex-1 flex flex-col gap-6 min-w-0 overflow-y-auto pr-2">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
              <ListChecks className="h-4 w-4" />
              Tarefas Semanais
            </div>
            <div className="space-y-3">
              {tasks.weekly.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 text-sm">
                  Nenhuma tarefa semanal. Use a IA para gerar!
                </p>
              ) : (
                tasks.weekly.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={index}
                    onToggle={(id) => toggleTask("weekly", id)}
                    onDelete={(id) => deleteTask("weekly", id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Column 3: Today + Notes */}
        <div className="flex-1 flex flex-col gap-6 min-w-0 overflow-y-auto pr-2">
          {/* Today Tasks */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
              <CalendarDays className="h-4 w-4" />
              Hoje
            </div>
            <div className="space-y-3">
              {tasks.today.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 text-sm">
                  Nenhuma tarefa para hoje
                </p>
              ) : (
                tasks.today.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={index}
                    onToggle={(id) => toggleTask("today", id)}
                    onDelete={(id) => deleteTask("today", id)}
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
