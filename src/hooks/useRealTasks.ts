// src/hooks/useRealTasks.ts - Updated to use UnifiedTask
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UnifiedTask } from '../types/tasks';
import UnifiedTaskService from '../services/tasks/unifiedTaskService';

export const useRealTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Record<string, UnifiedTask[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!user) {
      console.log('🔍 No user found, skipping task fetch');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Fetching unified tasks for timeline...');
      setLoading(true);

      // Use the unified task service directly
      const groupedTasks = await UnifiedTaskService.getTasksForTimeline();

      console.log(
        '✅ Unified tasks loaded:',
        Object.keys(groupedTasks).length,
        'days with tasks',
      );
      console.log('📊 Tasks by date:', JSON.stringify(groupedTasks, null, 2));
      setTasks(groupedTasks);
      setError(null);
    } catch (err) {
      console.error('❌ Failed to fetch unified tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      // Set empty tasks on error to prevent UI issues
      setTasks({});
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (taskId: string) => {
    try {
      console.log('🔄 Toggling unified task completion:', taskId);

      // Toggle in database using unified service
      const newCompletionState = await UnifiedTaskService.toggleTaskCompletion(
        taskId,
      );

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

      console.log('✅ Unified task completion toggled to:', newCompletionState);
    } catch (err) {
      console.error('❌ Failed to toggle unified task:', err);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      console.log('🗑️ Deleting unified task:', taskId);

      // Delete from database using unified service
      await UnifiedTaskService.deleteTask(taskId);

      // Remove from local state
      setTasks(prevTasks => {
        const newTasks = { ...prevTasks };
        Object.keys(newTasks).forEach(dateKey => {
          newTasks[dateKey] = newTasks[dateKey].filter(
            task => task.id !== taskId,
          );
        });
        return newTasks;
      });

      console.log('✅ Unified task deleted');
    } catch (err) {
      console.error('❌ Failed to delete unified task:', err);
      throw err;
    }
  };

  const updateTaskSteps = async (
    taskId: string,
    steps: Array<{ id: string; title: string; completed: boolean }>,
  ) => {
    try {
      console.log('📝 Updating unified task steps:', taskId);

      // Update in database using unified service
      await UnifiedTaskService.updateSteps(taskId, steps);

      // Update local state
      setTasks(prevTasks => {
        const newTasks = { ...prevTasks };
        Object.keys(newTasks).forEach(dateKey => {
          newTasks[dateKey] = newTasks[dateKey].map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                steps, // Primary field
                subtasks: steps, // Backward compatibility
              };
            }
            return task;
          });
        });
        return newTasks;
      });

      console.log('✅ Unified task steps updated');
    } catch (err) {
      console.error('❌ Failed to update unified task steps:', err);
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
    updateTaskSteps,
  };
};
