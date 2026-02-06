import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { Task } from "@/components/vde/TaskCard";
import { toast } from "@/hooks/use-toast";

const LOCAL_STORAGE_KEY = "vde_v4_data";

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Load tasks from Supabase or localStorage
  useEffect(() => {
    if (user) {
      loadTasksFromSupabase();
      subscribeToRealtimeChanges();
    } else {
      loadTasksFromLocalStorage();
    }
  }, [user]);

  const loadTasksFromSupabase = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      if (error) throw error;

      const mappedTasks: Task[] = (data || []).map((t) => ({
        id: t.id,
        text: t.text,
        description: t.description || undefined,
        done: t.done,
        priority: t.priority as "high" | "medium" | "low" | undefined,
        date: t.date || undefined,
        category: t.category || undefined,
        subject: t.subject || undefined,
        notes: t.notes || undefined,
      }));

      setTasks(mappedTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast({
        title: "Erro ao carregar tarefas",
        description: "Tente recarregar a página.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadTasksFromLocalStorage = useCallback(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTasks(parsed);
        } else if (parsed.tasks) {
          setTasks(parsed.tasks);
        }
      } catch {
        console.error("Failed to parse saved tasks");
      }
    }
    setLoading(false);
  }, []);

  const subscribeToRealtimeChanges = useCallback(() => {
    if (!user) return;

    const channel = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Realtime update:", payload);
          
          if (payload.eventType === "INSERT") {
            const newTask = payload.new as any;
            setTasks((prev) => {
              if (prev.find((t) => t.id === newTask.id)) return prev;
              return [...prev, {
                id: newTask.id,
                text: newTask.text,
                description: newTask.description || undefined,
                done: newTask.done,
                priority: newTask.priority as "high" | "medium" | "low" | undefined,
                date: newTask.date || undefined,
                category: newTask.category || undefined,
                subject: newTask.subject || undefined,
                notes: newTask.notes || undefined,
              }];
            });
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as any;
            setTasks((prev) =>
              prev.map((t) =>
                t.id === updated.id
                  ? {
                      ...t,
                      text: updated.text,
                      description: updated.description || undefined,
                      done: updated.done,
                      priority: updated.priority as "high" | "medium" | "low" | undefined,
                      date: updated.date || undefined,
                      category: updated.category || undefined,
                      subject: updated.subject || undefined,
                      notes: updated.notes || undefined,
                    }
                  : t
              )
            );
          } else if (payload.eventType === "DELETE") {
            const deleted = payload.old as any;
            setTasks((prev) => prev.filter((t) => t.id !== deleted.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addTasks = useCallback(
    async (newTasks: Omit<Task, "id">[]) => {
      if (user) {
        // Save to Supabase
        const tasksToInsert = newTasks.map((t) => ({
          user_id: user.id,
          text: t.text,
          description: t.description || null,
          done: t.done,
          priority: t.priority || "medium",
          date: t.date || null,
          category: t.category || null,
          subject: t.subject || null,
          notes: t.notes || null,
        }));

        const { data, error } = await supabase
          .from("tasks")
          .insert(tasksToInsert)
          .select();

        if (error) {
          console.error("Error adding tasks:", error);
          throw error;
        }

        // Realtime will handle the state update
        return data;
      } else {
        // Save to localStorage
        const tasksWithIds: Task[] = newTasks.map((t, i) => ({
          ...t,
          id: `${Date.now()}-${i}`,
        }));
        const updated = [...tasks, ...tasksWithIds];
        setTasks(updated);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return tasksWithIds;
      }
    },
    [user, tasks]
  );

  const toggleTask = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      const newDone = !task.done;

      if (user) {
        const { error } = await supabase
          .from("tasks")
          .update({ done: newDone })
          .eq("id", id);

        if (error) {
          console.error("Error toggling task:", error);
          return;
        }

        // Update streak if completing a task
        if (newDone) {
          await updateProgress();
        }
      } else {
        const updated = tasks.map((t) =>
          t.id === id ? { ...t, done: newDone } : t
        );
        setTasks(updated);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      }
    },
    [user, tasks]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      if (user) {
        const { error } = await supabase.from("tasks").delete().eq("id", id);
        if (error) {
          console.error("Error deleting task:", error);
          return;
        }
      } else {
        const updated = tasks.filter((t) => t.id !== id);
        setTasks(updated);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      }
    },
    [user, tasks]
  );

  const deleteCategory = useCallback(
    async (category: string) => {
      if (user) {
        const { error } = await supabase
          .from("tasks")
          .delete()
          .eq("user_id", user.id)
          .eq("category", category);

        if (error) {
          console.error("Error deleting category:", error);
          return;
        }
      } else {
        const updated = tasks.filter(
          (t) => (t.category || "Sem categoria") !== category
        );
        setTasks(updated);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      }
    },
    [user, tasks]
  );

  const updateTaskNotes = useCallback(
    async (id: string, notes: string) => {
      if (user) {
        const { error } = await supabase
          .from("tasks")
          .update({ notes })
          .eq("id", id);

        if (error) {
          console.error("Error updating notes:", error);
          return;
        }
      } else {
        const updated = tasks.map((t) =>
          t.id === id ? { ...t, notes } : t
        );
        setTasks(updated);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      }
    },
    [user, tasks]
  );

  const updateProgress = useCallback(async () => {
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];

    try {
      // Get current progress
      const { data: progress } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!progress) return;

      const lastStudyDate = progress.last_study_date;
      let newStreak = progress.current_streak;

      if (lastStudyDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (lastStudyDate === yesterdayStr) {
          newStreak += 1;
        } else if (lastStudyDate !== today) {
          newStreak = 1;
        }

        await supabase
          .from("user_progress")
          .update({
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, progress.longest_streak),
            total_completed: progress.total_completed + 1,
            last_study_date: today,
          })
          .eq("user_id", user.id);
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  }, [user]);

  return {
    tasks,
    loading,
    addTasks,
    toggleTask,
    deleteTask,
    deleteCategory,
    updateTaskNotes,
    refreshTasks: loadTasksFromSupabase,
  };
}
