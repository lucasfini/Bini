// src/services/tasks/supabaseTaskService.ts
import { supabase } from '../../config/supabase';

// Enhanced task interface that matches your CreateTaskTray
interface TaskFormData {
  title: string;
  description?: string;
  emoji?: string;
  time?: string;
  endTime?: string;
  when: string; // Date string
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  alerts: string[];
  category: string;
  priority: 'low' | 'medium' | 'high';
  isShared: boolean;
}

interface SimpleTask {
  id?: string;
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
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
  alerts?: string[];
}

class SupabaseTaskService {
  // Create a new task from the CreateTaskTray form
  async createTaskFromForm(formData: TaskFormData): Promise<SimpleTask> {
    console.log('🚀 Creating task from form:', formData.title);

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: formData.title,
        subtitle: formData.description,
        emoji: formData.emoji || '✨',
        time: formData.time,
        end_time: formData.endTime,
        date: formData.when,
        is_shared: formData.isShared,
        is_completed: false,
        category: formData.category,
        priority: formData.priority,
        created_by: user.user.id,
        assigned_to: [user.user.id], // For now, just assign to current user
        // Note: frequency and alerts aren't in our DB schema yet, we'll add them later
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Task creation failed:', error);
      throw new Error(`Failed to create task: ${error.message}`);
    }

    console.log('✅ Task created successfully:', data.id);
    return this.mapDatabaseTask(data);
  }

  // Create a simple task (legacy method)
  async createTask(task: Omit<SimpleTask, 'id'>): Promise<SimpleTask> {
    console.log('🚀 Creating simple task:', task.title);

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        subtitle: task.subtitle,
        emoji: task.emoji || '✨',
        time: task.time,
        end_time: task.endTime,
        date: task.date,
        is_shared: task.isShared,
        is_completed: task.isCompleted,
        category: task.category || 'Personal',
        priority: task.priority || 'medium',
        created_by: user.user.id,
        assigned_to: [user.user.id],
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Task creation failed:', error);
      throw new Error(`Failed to create task: ${error.message}`);
    }

    console.log('✅ Task created:', data.id);
    return this.mapDatabaseTask(data);
  }

  // Get tasks for the timeline
  async getTasksForTimeline(): Promise<Record<string, SimpleTask[]>> {
    console.log('🔍 Fetching tasks for timeline...');

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('Not authenticated');
    }

    // Get tasks for the next 7 days
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .or(`created_by.eq.${user.user.id},assigned_to.cs.{${user.user.id}}`)
      .gte('date', today.toISOString().split('T')[0])
      .lte('date', nextWeek.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      console.error('❌ Task fetch failed:', error);
      throw new Error(`Failed to fetch tasks: ${error.message}`);
    }

    console.log('✅ Fetched', data.length, 'tasks');

    // Group tasks by date keys for your timeline
    const groupedTasks: Record<string, SimpleTask[]> = {};
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    data.forEach(task => {
      const taskDate = task.date;
      let dateKey: string;

      if (taskDate === todayStr) {
        dateKey = 'today';
      } else if (taskDate === tomorrowStr) {
        dateKey = 'tomorrow';
      } else {
        // For other dates, use the actual date as key
        dateKey = taskDate;
      }

      if (!groupedTasks[dateKey]) {
        groupedTasks[dateKey] = [];
      }

      groupedTasks[dateKey].push(this.mapDatabaseTask(task));
    });

    return groupedTasks;
  }

  // Get tasks for a specific date range
  async getTasks(startDate?: string, endDate?: string): Promise<SimpleTask[]> {
    console.log('🔍 Fetching tasks...');

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('Not authenticated');
    }

    let query = supabase
      .from('tasks')
      .select('*')
      .or(`created_by.eq.${user.user.id},assigned_to.cs.{${user.user.id}}`);

    if (startDate && endDate) {
      query = query
        .gte('date', startDate)
        .lte('date', endDate);
    }

    const { data, error } = await query.order('date', { ascending: true });

    if (error) {
      console.error('❌ Task fetch failed:', error);
      throw new Error(`Failed to fetch tasks: ${error.message}`);
    }

    console.log('✅ Fetched', data.length, 'tasks');
    return data.map(this.mapDatabaseTask);
  }

  // Update a task
  async updateTask(taskId: string, updates: Partial<SimpleTask>): Promise<void> {
    console.log('🔄 Updating task:', taskId);

    const { error } = await supabase
      .from('tasks')
      .update({
        title: updates.title,
        subtitle: updates.subtitle,
        is_completed: updates.isCompleted,
        time: updates.time,
        end_time: updates.endTime,
        category: updates.category,
        priority: updates.priority,
      })
      .eq('id', taskId);

    if (error) {
      console.error('❌ Task update failed:', error);
      throw new Error(`Failed to update task: ${error.message}`);
    }

    console.log('✅ Task updated');
  }

  // Toggle task completion
  async toggleTaskCompletion(taskId: string): Promise<boolean> {
    console.log('✅ Toggling task completion:', taskId);

    // First get the current state
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('is_completed')
      .eq('id', taskId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch task: ${fetchError.message}`);
    }

    const newCompletionState = !task.is_completed;

    // Toggle the completion state
    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: newCompletionState })
      .eq('id', taskId);

    if (error) {
      throw new Error(`Failed to toggle task: ${error.message}`);
    }

    console.log('✅ Task completion toggled to:', newCompletionState);
    return newCompletionState;
  }

  // Delete a task
  async deleteTask(taskId: string): Promise<void> {
    console.log('🗑️ Deleting task:', taskId);

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('❌ Task deletion failed:', error);
      throw new Error(`Failed to delete task: ${error.message}`);
    }

    console.log('✅ Task deleted');
  }

  // Helper to map database task to our interface
  private mapDatabaseTask(dbTask: any): SimpleTask {
    return {
      id: dbTask.id,
      title: dbTask.title,
      subtitle: dbTask.subtitle,
      emoji: dbTask.emoji,
      time: dbTask.time,
      endTime: dbTask.end_time,
      date: dbTask.date,
      isShared: dbTask.is_shared,
      isCompleted: dbTask.is_completed,
      category: dbTask.category,
      priority: dbTask.priority,
    };
  }
}

export default new SupabaseTaskService();