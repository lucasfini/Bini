// src/services/tasks/unifiedTaskService.ts - Unified task service combining all functionality
import SupabaseTaskService from './supabaseTaskService';

// Enhanced task interface that matches your CreateTaskScreen
interface TaskFormData {
  title: string;
  emoji: string;
  when: {
    date: string;
    time: string;
  };
  durationMinutes: number;
  recurrence: {
    frequency: 'none' | 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: string[];
  };
  alerts: string[];
  details: string;
  isShared: boolean;
  subtasks: { id: string; title: string; completed: boolean }[];
}

interface SimpleTask {
  id?: string;
  title: string;
  date: string;
  isShared: boolean;
  isCompleted: boolean;
  emoji?: string;
  time?: string;
  start_time?: string;
  endTime?: string;
  end_time?: string;
  duration?: number;
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
  reoccurrence?: {
    frequency: 'none' | 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: string[];
  };
  alerts?: string[];
  details?: string;
  steps?: { id: string; title: string; completed: boolean }[];
  assignedTo?: string[];
  reactions?: any[];
  subtitle?: string;
  subtasks?: { id: string; title: string; completed: boolean }[];
  recurrence?: {
    frequency: 'none' | 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: string[];
  };
}

class UnifiedTaskService {
  // Create a task from the CreateTaskScreen form data
  async createTaskFromForm(formData: TaskFormData): Promise<SimpleTask> {
    console.log(
      '🚀 UnifiedTaskService: Creating task from form:',
      formData.title,
    );
    console.log('📝 Full form data:', JSON.stringify(formData, null, 2));

    try {
      // Use the existing Supabase task service
      const newTask = await SupabaseTaskService.createTaskFromForm(formData);
      console.log(
        '✅ UnifiedTaskService: Task created successfully:',
        newTask.id,
      );
      return newTask;
    } catch (error) {
      console.error('❌ UnifiedTaskService: Failed to create task:', error);
      throw error;
    }
  }

  // Get tasks for the timeline with proper grouping
  async getTasksForTimeline(): Promise<Record<string, SimpleTask[]>> {
    console.log('🔍 UnifiedTaskService: Fetching tasks for timeline...');

    try {
      const groupedTasks = await SupabaseTaskService.getTasksForTimeline();
      console.log('✅ UnifiedTaskService: Tasks fetched successfully');
      console.log('📊 Grouped tasks by keys:', Object.keys(groupedTasks));
      return groupedTasks;
    } catch (error) {
      console.error('❌ UnifiedTaskService: Failed to fetch tasks:', error);
      throw error;
    }
  }

  // Get tasks for a specific date range
  async getTasks(startDate?: string, endDate?: string): Promise<SimpleTask[]> {
    console.log('🔍 UnifiedTaskService: Fetching tasks...');

    try {
      const tasks = await SupabaseTaskService.getTasks(startDate, endDate);
      console.log(
        '✅ UnifiedTaskService: Tasks fetched:',
        tasks.length,
        'tasks',
      );
      return tasks;
    } catch (error) {
      console.error('❌ UnifiedTaskService: Failed to fetch tasks:', error);
      throw error;
    }
  }

  // Update a task
  async updateTask(
    taskId: string,
    updates: Partial<SimpleTask>,
  ): Promise<void> {
    console.log('🔄 UnifiedTaskService: Updating task:', taskId);

    try {
      await SupabaseTaskService.updateTask(taskId, updates);
      console.log('✅ UnifiedTaskService: Task updated successfully');
    } catch (error) {
      console.error('❌ UnifiedTaskService: Failed to update task:', error);
      throw error;
    }
  }

  // Toggle task completion
  async toggleTaskCompletion(taskId: string): Promise<boolean> {
    console.log('✅ UnifiedTaskService: Toggling task completion:', taskId);

    try {
      const newCompletionState = await SupabaseTaskService.toggleTaskCompletion(
        taskId,
      );
      console.log(
        '✅ UnifiedTaskService: Task completion toggled to:',
        newCompletionState,
      );
      return newCompletionState;
    } catch (error) {
      console.error(
        '❌ UnifiedTaskService: Failed to toggle task completion:',
        error,
      );
      throw error;
    }
  }

  // Update steps for a task
  async updateSteps(
    taskId: string,
    steps: { id: string; title: string; completed: boolean }[],
  ): Promise<void> {
    console.log('📝 UnifiedTaskService: Updating steps for task:', taskId);

    try {
      await SupabaseTaskService.updateSteps(taskId, steps);
      console.log('✅ UnifiedTaskService: Steps updated successfully');
    } catch (error) {
      console.error('❌ UnifiedTaskService: Failed to update steps:', error);
      throw error;
    }
  }

  // Delete a task
  async deleteTask(taskId: string): Promise<void> {
    console.log('🗑️ UnifiedTaskService: Deleting task:', taskId);

    try {
      await SupabaseTaskService.deleteTask(taskId);
      console.log('✅ UnifiedTaskService: Task deleted successfully');
    } catch (error) {
      console.error('❌ UnifiedTaskService: Failed to delete task:', error);
      throw error;
    }
  }

  // Create a simple task (legacy method)
  async createTask(task: Omit<SimpleTask, 'id'>): Promise<SimpleTask> {
    console.log('🚀 UnifiedTaskService: Creating simple task:', task.title);

    try {
      const newTask = await SupabaseTaskService.createTask(task);
      console.log('✅ UnifiedTaskService: Simple task created:', newTask.id);
      return newTask;
    } catch (error) {
      console.error(
        '❌ UnifiedTaskService: Failed to create simple task:',
        error,
      );
      throw error;
    }
  }
}

export default new UnifiedTaskService();
