// src/services/tasks/supabaseTaskService.ts - Fixed date mapping
import { supabase } from '../../config/supabase';

// Enhanced task interface that matches your CreateTaskTray
interface TaskFormData {
  title: string;
  description?: string;
  emoji?: string;
  time?: string;
  endTime?: string;
  when: string; // 'today', 'tomorrow', 'saturday', or date string
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
  alerts?: string[];
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
  // Helper to convert 'today', 'tomorrow', 'saturday' to actual dates
  private convertWhenToDate(when: string): string {
    const today = new Date();
    
    switch (when) {
      case 'today':
        return today.toISOString().split('T')[0];
      
      case 'tomorrow': {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
      }
      
      case 'saturday': {
        const saturday = new Date(today);
        const daysUntilSaturday = (6 - today.getDay()) % 7;
        saturday.setDate(today.getDate() + daysUntilSaturday);
        return saturday.toISOString().split('T')[0];
      }
      
      default:
        // If it's already a date string, return as is
        return when;
    }
  }

  // Helper to convert date back to 'today', 'tomorrow', 'saturday' keys
  private convertDateToWhen(dateString: string): string {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // Get next Saturday
    const todayDate = new Date();
    const saturday = new Date(todayDate);
    const daysUntilSaturday = (6 - todayDate.getDay()) % 7;
    saturday.setDate(todayDate.getDate() + daysUntilSaturday);
    const saturdayStr = saturday.toISOString().split('T')[0];

    if (dateString === today) return 'today';
    if (dateString === tomorrowStr) return 'tomorrow';
    if (dateString === saturdayStr) return 'saturday';
    
    // For any other date, return the date string itself
    return dateString;
  }

  // Create a new task from the CreateTaskTray form
  async createTaskFromForm(formData: TaskFormData): Promise<SimpleTask> {
    console.log('🚀 Creating task from form:', formData.title);

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('Not authenticated');
    }

    // Convert 'when' to actual date
    const actualDate = this.convertWhenToDate(formData.when);
    console.log('📅 Converting when:', formData.when, '→', actualDate);

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: formData.title.trim(),
        subtitle: formData.description?.trim() || null,
        emoji: formData.emoji || '✨',
        time: formData.time || null,
        end_time: formData.endTime || null,
        date: actualDate, // Use the converted date
        is_shared: formData.isShared,
        is_completed: false,
        category: formData.category,
        priority: formData.priority,
        created_by: user.user.id,
        assigned_to: [user.user.id], // For now, just assign to current user
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Task creation failed:', error);
      throw new Error(`Failed to create task: ${error.message}`);
    }

    console.log('✅ Task created successfully:', data.id, 'for date:', actualDate);
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

  // Get tasks for the timeline with proper grouping
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

    // Group tasks by 'today', 'tomorrow', 'saturday' keys
    const groupedTasks: Record<string, SimpleTask[]> = {};

    data.forEach(task => {
      const dateKey = this.convertDateToWhen(task.date);
      
      if (!groupedTasks[dateKey]) {
        groupedTasks[dateKey] = [];
      }

      groupedTasks[dateKey].push(this.mapDatabaseTask(task));
    });

    console.log('📊 Grouped tasks by keys:', Object.keys(groupedTasks));
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