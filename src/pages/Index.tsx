import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, CalendarDays, Menu, Timer, User, LogOut } from "lucide-react";
import { Sidebar } from "@/components/vde/Sidebar";
import { AddSubjectModal } from "@/components/vde/AddSubjectModal";
import { TaskNotesModal } from "@/components/vde/TaskNotesModal";
import { TaskCard, Task } from "@/components/vde/TaskCard";
import { FeedbackOverlay } from "@/components/vde/FeedbackOverlay";
import { StudyStreak } from "@/components/vde/StudyStreak";
import { PomodoroTimer } from "@/components/vde/PomodoroTimer";
import { EmptyState } from "@/components/vde/EmptyState";
import { LoadingShimmer } from "@/components/vde/LoadingShimmer";
import { MotionContainer, MotionItem } from "@/components/vde/MotionCard";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/hooks/use-auth";
import { useTasks } from "@/hooks/use-tasks";
import { useProgress } from "@/hooks/use-progress";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const { user, signOut, loading: authLoading } = useAuth();
  const { tasks, loading: tasksLoading, addTasks, toggleTask, deleteTask, deleteCategory, updateTaskNotes } = useTasks();
  const { progress } = useProgress(tasks);
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const isMobile = useIsMobile();
  
  const [feedback, setFeedback] = useState<{
    show: boolean;
    type: "loading" | "success" | "error" | "complete";
    message: string;
  }>({ show: false, type: "loading", message: "" });

  // Minimum splash screen duration (3 seconds)
  useEffect(() => {
    const minDuration = 3000;
    const timer = setTimeout(() => {
      if (!authLoading) {
        setShowSplash(false);
      }
    }, minDuration);

    return () => clearTimeout(timer);
  }, [authLoading]);

  // Also hide splash when auth finishes (but respect minimum duration)
  useEffect(() => {
    if (!authLoading && !showSplash) return;
    
    // If auth is done but splash is still showing due to minimum duration, that's fine
    // The timeout above will handle it
  }, [authLoading, showSplash]);

  // Auth guard: show modal when no user after splash
  useEffect(() => {
    if (!showSplash && !user) {
      setAuthModalOpen(true);
    }
  }, [showSplash, user]);

  // Get unique categories for color mapping
  const uniqueCategories = [...new Set(tasks.map((t) => t.category || "Geral"))];

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const handleTasksGenerated = useCallback(
    async (aiTasks: { text: string; priority: string; date?: string; category?: string; subject?: string; description?: string }[], analysis?: { dificuldade_estimada: number; horas_totais: number }) => {
      const newTasks = aiTasks.map((t) => ({
        text: t.text,
        done: false,
        priority: (t.priority as "high" | "medium" | "low") || "medium",
        date: t.date || new Date().toISOString().split("T")[0],
        category: t.category || "Geral",
        subject: t.subject,
        description: t.description || t.text,
      }));

      try {
        await addTasks(newTasks);

        let message = `✅ ${newTasks.length} tarefas criadas!`;
        if (analysis) {
          message += ` (Dificuldade: ${analysis.dificuldade_estimada}/5, ~${analysis.horas_totais}h)`;
        }

        setFeedback({
          show: true,
          type: "success",
          message,
        });

        // Close sidebar on mobile after generating tasks
        if (isMobile) {
          setSidebarOpen(false);
        }
      } catch (error) {
        toast({
          title: "Erro ao salvar tarefas",
          description: "Tente novamente.",
          variant: "destructive",
        });
      }
    },
    [addTasks, isMobile]
  );

  const handleToggleTask = useCallback(
    async (id: string) => {
      await toggleTask(id);
      const task = tasks.find((t) => t.id === id);
      if (task && !task.done) {
        setFeedback({
          show: true,
          type: "success",
          message: "Tarefa concluída! 🎉",
        });
      }
    },
    [tasks, toggleTask]
  );

  const handleDeleteTask = useCallback(
    async (id: string) => {
      await deleteTask(id);
      toast({
        title: "Tarefa removida",
        description: "A tarefa foi excluída com sucesso.",
      });
    },
    [deleteTask]
  );

  const handleDeleteCategory = useCallback(
    async (category: string) => {
      await deleteCategory(category);
      toast({
        title: "Matéria removida",
        description: `Todas as tarefas de "${category}" foram excluídas.`,
      });
    },
    [deleteCategory]
  );

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setNotesModalOpen(true);
  }, []);

  const handleSaveNotes = useCallback(
    async (taskId: string, notes: string) => {
      await updateTaskNotes(taskId, notes);
      toast({
        title: "Anotações salvas",
        description: "Suas anotações foram salvas com sucesso.",
      });
    },
    [updateTaskNotes]
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

  // Splash screen with minimum duration
  if (showSplash || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="flex flex-col items-center gap-4"
        >
          <div className="p-4 rounded-3xl bg-primary/10 border border-primary/20">
            <Bot className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">VDE AI</h1>
        </motion.div>
        <LoadingShimmer message="Preparando seu dashboard..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background overflow-hidden relative">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"
          animate={{ 
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/3 rounded-full blur-[150px]"
          animate={{ 
            y: [0, 20, 0],
            x: [0, -10, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* Feedback Overlay */}
      <FeedbackOverlay
        show={feedback.show}
        type={feedback.type}
        message={feedback.message}
        onHide={() => setFeedback((prev) => ({ ...prev, show: false }))}
      />

      {/* Auth Modal - forceOpen when no user */}
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
        forceOpen={!user}
      />

      {/* Task Notes Modal */}
      <TaskNotesModal
        task={selectedTask}
        open={notesModalOpen}
        onOpenChange={setNotesModalOpen}
        onSaveNotes={handleSaveNotes}
      />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div 
        className={cn(
          "transition-transform duration-300 ease-out z-50",
          isMobile && "fixed inset-y-0 left-0",
          isMobile && !sidebarOpen && "-translate-x-full"
        )}
        initial={isMobile ? { x: "-100%" } : false}
        animate={isMobile ? { x: sidebarOpen ? 0 : "-100%" } : {}}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Sidebar
          tasks={tasks}
          selectedDate={selectedDate}
          onSelectDate={(date) => {
            setSelectedDate(date);
            if (isMobile) setSidebarOpen(false);
          }}
          onDeleteCategory={handleDeleteCategory}
          onClose={() => setSidebarOpen(false)}
        />
      </motion.div>

      {/* Main Content */}
      <main className={cn(
        "flex-1 flex flex-col gap-3 p-3 overflow-y-auto relative z-10",
        "md:gap-6 md:p-6 lg:p-8",
        "transition-all duration-300"
      )}>
        {/* Mobile Header */}
        {isMobile && (
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
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
            {user ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                className="h-10 w-10 rounded-xl glass-subtle"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAuthModalOpen(true)}
                className="h-10 w-10 rounded-xl glass-subtle"
              >
                <User className="h-5 w-5" />
              </Button>
            )}
          </motion.div>
        )}

        {/* Mobile: Slim cards - Modo Foco + Progresso side by side with equal width */}
        {isMobile && (
          <MotionContainer className="grid grid-cols-2 gap-2" staggerDelay={0.1}>
            {/* Slim Pomodoro - Square layout */}
            <MotionItem>
              <motion.div 
                className="glass-card rounded-xl p-3 glass-card-hover h-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 rounded-lg bg-primary/10 border border-primary/20">
                    <Timer className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                    Foco
                  </span>
                </div>
                <PomodoroTimer onComplete={handlePomodoroComplete} compact />
              </motion.div>
            </MotionItem>

            {/* Slim Progress - Equal width */}
            <MotionItem>
              <StudyStreak tasks={tasks} progress={progress} compact />
            </MotionItem>
          </MotionContainer>
        )}

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-3 md:gap-6 flex-1">
          {/* Left Column: Planning */}
          <MotionContainer className="flex flex-col gap-3 md:gap-6" staggerDelay={0.15}>
            {/* Planning Card */}
            <MotionItem>
              <motion.div 
                className="glass-card rounded-2xl md:rounded-3xl p-4 md:p-6 glass-card-hover relative overflow-hidden"
                whileHover={{ scale: 1.005 }}
                transition={{ duration: 0.2 }}
              >
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div className="flex items-center gap-3">
                      <motion.div 
                        className="p-2 md:p-2.5 rounded-xl md:rounded-2xl bg-primary/10 border border-primary/20"
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <CalendarDays className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                      </motion.div>
                      <div>
                        <h2 className="text-lg md:text-xl font-bold">
                          {isToday ? "Planejamento de Hoje" : "Tarefas do Dia"}
                        </h2>
                        <p className="text-xs md:text-sm text-muted-foreground capitalize">
                          {formatDisplayDate(selectedDate)}
                        </p>
                      </div>
                    </div>
                    <AddSubjectModal 
                      onTasksGenerated={handleTasksGenerated}
                      onLoadingChange={setIsGenerating}
                    />
                  </div>

                  {/* Loading State */}
                  <AnimatePresence mode="wait">
                    {isGenerating ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <LoadingShimmer />
                      </motion.div>
                    ) : tasksLoading ? (
                      <motion.div
                        key="tasks-loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center py-12"
                      >
                        <LoadingShimmer message="Carregando tarefas..." />
                      </motion.div>
                    ) : filteredTasks.length === 0 ? (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <EmptyState type="tasks" />
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="tasks"
                        className="space-y-2 md:space-y-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {filteredTasks.map((task, index) => (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ 
                              opacity: hoveredCardId && hoveredCardId !== task.id ? 0.7 : 1, 
                              y: 0,
                              scale: hoveredCardId === task.id ? 1.02 : 1,
                            }}
                            transition={{ 
                              delay: index * 0.05,
                              duration: 0.3,
                            }}
                            onHoverStart={() => setHoveredCardId(task.id)}
                            onHoverEnd={() => setHoveredCardId(null)}
                          >
                            <TaskCard
                              task={task}
                              index={index}
                              onToggle={handleToggleTask}
                              onDelete={handleDeleteTask}
                              onClick={handleTaskClick}
                              categoryColor={getCategoryColor(task.category || "Geral", uniqueCategories)}
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </MotionItem>
          </MotionContainer>

          {/* Right Column: Pomodoro + Progress (Desktop only) */}
          {!isMobile && (
            <MotionContainer className="flex flex-col gap-3 md:gap-6" staggerDelay={0.2}>
              {/* User Auth Button */}
              <MotionItem>
                <motion.div 
                  className="glass-card rounded-2xl p-4 glass-card-hover"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  {user ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium truncate max-w-[150px]">
                            {user.email?.split("@")[0]}
                          </p>
                          <p className="text-xs text-muted-foreground">Sincronizado</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => signOut()}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 h-auto py-3 rounded-xl border-border/50"
                      onClick={() => setAuthModalOpen(true)}
                    >
                      <div className="p-2 rounded-lg bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium">Entrar ou Criar Conta</p>
                        <p className="text-xs text-muted-foreground">Sincronize seus dados</p>
                      </div>
                    </Button>
                  )}
                </motion.div>
              </MotionItem>

              {/* Pomodoro Timer */}
              <MotionItem>
                <motion.div 
                  className="glass-card rounded-2xl p-4 md:p-5 glass-card-hover"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                      <Timer className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Modo Foco
                    </span>
                  </div>
                  <PomodoroTimer onComplete={handlePomodoroComplete} />
                </motion.div>
              </MotionItem>

              {/* Study Streak */}
              <MotionItem>
                <StudyStreak tasks={tasks} progress={progress} />
              </MotionItem>
            </MotionContainer>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
