import { useState, useEffect, useCallback } from "react";
import { Bot, CalendarDays, Sparkles, Menu, Plus, Timer } from "lucide-react";
import { Sidebar } from "@/components/vde/Sidebar";
import { AddSubjectModal } from "@/components/vde/AddSubjectModal";
import { TaskNotesModal } from "@/components/vde/TaskNotesModal";
import { TaskCard, Task } from "@/components/vde/TaskCard";
import { FeedbackOverlay } from "@/components/vde/FeedbackOverlay";
import { StudyStreak } from "@/components/vde/StudyStreak";
import { PomodoroTimer } from "@/components/vde/PomodoroTimer";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "vde_v4_data";

// Color palette for categories - distinct vibrant colors
const CATEGORY_COLORS = [
  { border: "border-l-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
  { border: "border-l-violet-500", bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400" },
  { border: "border-l-amber-500", bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  { border: "border-l-rose-500", bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400" },
  { border: "border-l-cyan-500", bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400" },
  { border: "border-l-orange-500", bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400" },
  { border: "border-l-pink-500", bg: "bg-pink-500/10", text: "text-pink-600 dark:text-pink-400" },
  { border: "border-l-teal-500", bg: "bg-teal-500/10", text: "text-teal-600 dark:text-teal-400" },
  { border: "border-l-indigo-500", bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400" },
  { border: "border-l-lime-500", bg: "bg-lime-500/10", text: "text-lime-600 dark:text-lime-400" },
];

export function getCategoryColor(category: string, allCategories: string[]) {
  const index = allCategories.indexOf(category);
  if (index === -1) return CATEGORY_COLORS[0];
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const [feedback, setFeedback] = useState<{
    show: boolean;
    type: "loading" | "success" | "error" | "complete";
    message: string;
  }>({ show: false, type: "loading", message: "" });

  // Get unique categories for color mapping
  const uniqueCategories = [...new Set(tasks.map((t) => t.category || "Geral"))];

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

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

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

      // Close sidebar on mobile after generating tasks
      if (isMobile) {
        setSidebarOpen(false);
      }
    },
    [tasks, saveTasks, isMobile]
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

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "transition-transform duration-300 ease-out z-50",
        isMobile && "fixed inset-y-0 left-0",
        isMobile && !sidebarOpen && "-translate-x-full"
      )}>
        <Sidebar
          tasks={tasks}
          selectedDate={selectedDate}
          onSelectDate={(date) => {
            setSelectedDate(date);
            if (isMobile) setSidebarOpen(false);
          }}
          onDeleteCategory={deleteCategory}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <main className={cn(
        "flex-1 flex flex-col gap-3 p-3 overflow-y-auto relative z-10",
        "md:gap-6 md:p-6 lg:p-8",
        "transition-all duration-300"
      )}>
        {/* Mobile Header */}
        {isMobile && (
          <div className="flex items-center justify-between animate-fade-in">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="h-10 w-10 rounded-xl glass-subtle micro-bounce"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-lg">VDE AI</span>
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>
        )}

        {/* Mobile: Slim cards - Modo Foco + Progresso side by side */}
        {isMobile && (
          <div className="grid grid-cols-2 gap-2 animate-slide-in-left">
            {/* Slim Pomodoro */}
            <div className="glass-card rounded-xl p-3 glass-card-hover">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 rounded-lg bg-primary/10 border border-primary/20">
                  <Timer className="h-3 w-3 text-primary" />
                </div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                  Foco
                </span>
              </div>
              <PomodoroTimer onComplete={handlePomodoroComplete} compact />
            </div>

            {/* Slim Progress */}
            <StudyStreak tasks={tasks} compact />
          </div>
        )}

        {/* Desktop Layout: Main content grid */}
        <div className={cn(
          "flex flex-col gap-4",
          "lg:grid lg:grid-cols-[1fr,320px] lg:gap-6"
        )}>
          {/* Left Column: AI Planner + Tasks */}
          <div className="flex flex-col gap-4 lg:gap-6">
            {/* Hero Card - AI Planner */}
            <div className="glass-card rounded-2xl md:rounded-3xl p-4 md:p-6 glass-card-hover relative overflow-hidden animate-slide-in-left">
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl" />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-primary/10 border border-primary/20">
                      <Bot className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-lg md:text-xl font-black flex items-center gap-2">
                        <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-primary animate-pulse" />
                        Planejamento AI
                      </h1>
                      <p className="text-[10px] md:text-xs text-muted-foreground">
                        Gere cronogramas inteligentes com IA
                      </p>
                    </div>
                  </div>
                  
                  {/* Compact Add Button */}
                  <AddSubjectModal onTasksGenerated={handleTasksGenerated} />
                </div>
              </div>
            </div>

            {/* Tasks Section */}
            <div className="glass-card rounded-2xl md:rounded-3xl p-4 md:p-6 flex-1 glass-card-hover animate-slide-in-left" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-primary/10 border border-primary/20">
                  <CalendarDays className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-bold">
                    {isToday ? "Tarefas de Hoje" : formatDisplayDate(selectedDate)}
                  </h2>
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    {filteredTasks.length} {filteredTasks.length === 1 ? "tarefa" : "tarefas"} programadas
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 md:space-y-3">
                {filteredTasks.length === 0 ? (
                  <div className="glass-subtle rounded-xl md:rounded-2xl p-6 md:p-10 text-center animate-scale-in">
                    <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                      <CalendarDays className="h-6 w-6 md:h-7 md:w-7 text-primary/50" />
                    </div>
                    <p className="text-muted-foreground text-xs md:text-sm">
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
                      categoryColor={getCategoryColor(task.category || "Geral", uniqueCategories)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Modo Foco + Progresso (Desktop Only) */}
          {!isMobile && (
            <div className="hidden lg:flex flex-col gap-4 animate-slide-in-right">
              {/* Modo Foco / Pomodoro */}
              <div className="glass-card rounded-2xl p-5 glass-card-hover relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
                
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                      <Timer className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Modo Foco
                    </span>
                  </div>
                  <PomodoroTimer onComplete={handlePomodoroComplete} />
                </div>
              </div>

              {/* Progresso */}
              <StudyStreak tasks={tasks} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
