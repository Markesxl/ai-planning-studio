import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/studyflow/Header";
import { TabNavigation } from "@/components/studyflow/TabNavigation";
import { StatsCards } from "@/components/studyflow/StatsCards";
import { TaskList } from "@/components/studyflow/TaskList";
import { RightSidebar } from "@/components/studyflow/RightSidebar";
import { SubjectsView } from "@/components/studyflow/SubjectsView";
import { NewSubjectModal } from "@/components/studyflow/NewSubjectModal";
import { FeedbackOverlay } from "@/components/vde/FeedbackOverlay";
import { Task } from "@/components/studyflow/TaskCard";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "studyflow_v1_data";

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<"overview" | "subjects">("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
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
        if (Array.isArray(parsed.tasks)) {
          setTasks(parsed.tasks);
        }
        if (typeof parsed.pomodoroCount === "number") {
          setPomodoroCount(parsed.pomodoroCount);
        }
      } catch {
        console.error("Failed to parse saved data");
      }
    }

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Save data to localStorage
  const saveData = useCallback((newTasks: Task[], newPomodoroCount?: number) => {
    setTasks(newTasks);
    const count = newPomodoroCount ?? pomodoroCount;
    if (newPomodoroCount !== undefined) {
      setPomodoroCount(newPomodoroCount);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
      tasks: newTasks, 
      pomodoroCount: count 
    }));
  }, [pomodoroCount]);

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

      saveData([...tasks, ...newTasks]);

      setFeedback({
        show: true,
        type: "success",
        message: `✅ ${newTasks.length} tarefas criadas!`,
      });
    },
    [tasks, saveData]
  );

  // Toggle task completion
  const toggleTask = useCallback(
    (id: string) => {
      const updatedTasks = tasks.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      );
      saveData(updatedTasks);

      const task = updatedTasks.find((t) => t.id === id);
      if (task?.done) {
        setFeedback({
          show: true,
          type: "success",
          message: "Tarefa concluída! 🎉",
        });
      }
    },
    [tasks, saveData]
  );

  // Delete task
  const deleteTask = useCallback(
    (id: string) => {
      const updatedTasks = tasks.filter((t) => t.id !== id);
      saveData(updatedTasks);
      toast({
        title: "Tarefa removida",
        description: "A tarefa foi excluída com sucesso.",
      });
    },
    [tasks, saveData]
  );

  // Delete all tasks in a category
  const deleteCategory = useCallback(
    (category: string) => {
      const updatedTasks = tasks.filter((t) => (t.category || "Sem categoria") !== category);
      saveData(updatedTasks);
      toast({
        title: "Matéria removida",
        description: `Todas as tarefas de "${category}" foram excluídas.`,
      });
    },
    [tasks, saveData]
  );

  // Pomodoro complete handler
  const handlePomodoroComplete = useCallback(() => {
    const newCount = pomodoroCount + 1;
    saveData(tasks, newCount);
    setFeedback({
      show: true,
      type: "complete",
      message: "Pomodoro Concluído! 🏆",
    });
  }, [pomodoroCount, tasks, saveData]);

  // Get task dates for calendar
  const taskDates = tasks
    .filter((t) => t.date)
    .map((t) => t.date as string);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Feedback Overlay */}
      <FeedbackOverlay
        show={feedback.show}
        type={feedback.type}
        message={feedback.message}
        onHide={() => setFeedback((prev) => ({ ...prev, show: false }))}
      />

      {/* New Subject Modal */}
      <NewSubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTasksGenerated={handleTasksGenerated}
      />

      {/* Header */}
      <Header onNewSubject={() => setIsModalOpen(true)} />

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 flex gap-6 p-6 overflow-hidden">
        {activeTab === "overview" ? (
          <>
            {/* Main Area */}
            <div className="flex-1 flex flex-col gap-6 min-w-0 overflow-y-auto">
              {/* Stats Cards */}
              <StatsCards tasks={tasks} pomodoroCount={pomodoroCount} />

              {/* Task List */}
              <TaskList
                tasks={tasks}
                selectedDate={selectedDate}
                onToggle={toggleTask}
                onDelete={deleteTask}
              />
            </div>

            {/* Right Sidebar */}
            <RightSidebar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              taskDates={taskDates}
              onPomodoroComplete={handlePomodoroComplete}
            />
          </>
        ) : (
          <SubjectsView
            tasks={tasks}
            onNewSubject={() => setIsModalOpen(true)}
            onDeleteCategory={deleteCategory}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
