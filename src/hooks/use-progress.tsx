import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { Task } from "@/components/vde/TaskCard";

interface Progress {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  weeklyCompleted: number;
  completionRate: number;
  lastStudyDate: string | null;
}

export function useProgress(tasks: Task[]) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Progress>({
    currentStreak: 0,
    longestStreak: 0,
    totalCompleted: 0,
    weeklyCompleted: 0,
    completionRate: 0,
    lastStudyDate: null,
  });
  const [loading, setLoading] = useState(true);

  // Calculate progress from tasks (for non-authenticated users)
  const calculateLocalProgress = useCallback(() => {
    const completedTasks = tasks.filter((t) => t.done);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate streak
    let streak = 0;
    let currentDate = new Date(today);

    // Check today first
    const todayStr = currentDate.toISOString().split("T")[0];
    const hasTodayCompleted = completedTasks.some((t) => t.date === todayStr);

    if (hasTodayCompleted) {
      streak = 1;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    // Check previous days
    while (true) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const hasCompletedTask = completedTasks.some((t) => t.date === dateStr);
      if (hasCompletedTask) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate weekly progress
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyCompleted = completedTasks.filter((t) => {
      if (!t.date) return false;
      const taskDate = new Date(t.date);
      return taskDate >= weekAgo && taskDate <= today;
    }).length;

    // Calculate total completion rate
    const totalTasks = tasks.length;
    const completionRate =
      totalTasks > 0
        ? Math.round((completedTasks.length / totalTasks) * 100)
        : 0;

    return {
      currentStreak: streak,
      longestStreak: streak, // We don't persist this for non-auth users
      totalCompleted: completedTasks.length,
      weeklyCompleted,
      completionRate,
      lastStudyDate: todayStr,
    };
  }, [tasks]);

  // Load progress from Supabase or calculate locally
  useEffect(() => {
    if (user) {
      loadProgressFromSupabase();
      subscribeToRealtimeProgress();
    } else {
      const localProgress = calculateLocalProgress();
      setProgress(localProgress);
      setLoading(false);
    }
  }, [user, tasks, calculateLocalProgress]);

  const loadProgressFromSupabase = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        // Also calculate weekly from tasks
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const completedTasks = tasks.filter((t) => t.done);
        const weeklyCompleted = completedTasks.filter((t) => {
          if (!t.date) return false;
          const taskDate = new Date(t.date);
          return taskDate >= weekAgo && taskDate <= today;
        }).length;

        const totalTasks = tasks.length;
        const completionRate =
          totalTasks > 0
            ? Math.round((completedTasks.length / totalTasks) * 100)
            : 0;

        setProgress({
          currentStreak: data.current_streak,
          longestStreak: data.longest_streak,
          totalCompleted: data.total_completed,
          weeklyCompleted,
          completionRate,
          lastStudyDate: data.last_study_date,
        });
      }
    } catch (error) {
      console.error("Error loading progress:", error);
    } finally {
      setLoading(false);
    }
  }, [user, tasks]);

  const subscribeToRealtimeProgress = useCallback(() => {
    if (!user) return;

    const channel = supabase
      .channel("progress-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "user_progress",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Progress update:", payload);
          const updated = payload.new as any;
          
          setProgress((prev) => ({
            ...prev,
            currentStreak: updated.current_streak,
            longestStreak: updated.longest_streak,
            totalCompleted: updated.total_completed,
            lastStudyDate: updated.last_study_date,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { progress, loading };
}
