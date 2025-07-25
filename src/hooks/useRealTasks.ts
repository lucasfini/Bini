// src/hooks/useRealTasks.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface SimpleTask {
  id: string;
  title: string;
  subtitle?: string;
  emoji?: string;
  time?: string;
  endTime?: string;
  date: string;
  isShared: boolean;
  isCompleted: boolean;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  assignedTo: string[];
  reactions: any[];
}

export const useRealTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Record<string, SimpleTask[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Fetching real tasks for timeline...');
      setLoading(true);
      
      // Import task service
      const { default: SupabaseTaskService } = await import('../services/tasks/supabaseTaskService');
      
      // Get tasks grouped for timeline
      const groupedTasks = await SupabaseTaskService.getTasksForTimeline();
      
      console.log('✅ Real tasks loaded:', Object.keys(groupedTasks).length, 'days with tasks');
      setTasks(groupedTasks);
      setError(null);
    } catch (err) {
      console.error('❌ Failed to fetch tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (taskId: string) => {
    try {
      console.log('🔄 Toggling task completion:', taskId);
      
      // Import task service
      const { default: SupabaseTaskService } = await import('../services/tasks/supabaseTaskService');
      
      // Toggle in database
      const newCompletionState = await SupabaseTaskService.toggleTaskCompletion(taskId);
      
      // Update local state
      setTasks(prevTasks => {
        const newTasks = { ...prevTasks };
        Object.keys(newTasks).forEach(dateKey => {
          newTasks[dateKey] = newTasks[dateKey].map(task => {
            if (task.id === taskId) {
              return { ...task, isCompleted: newCompletionState };
            }
            return task;
          });
        });
        return newTasks;
      });
      
      console.log('✅ Task completion toggled to:', newCompletionState);
    } catch (err) {
      console.error('❌ Failed to toggle task:', err);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      console.log('🗑️ Deleting task:', taskId);
      
      // Import task service
      const { default: SupabaseTaskService } = await import('../services/tasks/supabaseTaskService');
      
      // Delete from database
      await SupabaseTaskService.deleteTask(taskId);
      
      // Remove from local state
      setTasks(prevTasks => {
        const newTasks = { ...prevTasks };
        Object.keys(newTasks).forEach(dateKey => {
          newTasks[dateKey] = newTasks[dateKey].filter(task => task.id !== taskId);
        });
        return newTasks;
      });
      
      console.log('✅ Task deleted');
    } catch (err) {
      console.error('❌ Failed to delete task:', err);
      throw err;
    }
  };

  // Fetch tasks when user changes or on mount
  useEffect(() => {
    fetchTasks();
  }, [user]);

  // Refresh function for pull-to-refresh
  const refreshTasks = async () => {
    await fetchTasks();
  };

  return {
    tasks,
    loading,
    error,
    refreshTasks,
    toggleTaskCompletion,
    deleteTask,
  };
};