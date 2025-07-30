// src/services/tasks/supabaseTaskService.ts - Fixed date mapping
import { supabase } from '../../config/supabase';

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
  assignedTo?: string[];
  reactions?: any[];
  subtasks?: { id: string; title: string; completed: boolean }[];
  recurrence?: {
    frequency: 'none' | 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: string[];
  };
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

  // Create a new task from the CreateTaskScreen form
  async createTaskFromForm(formData: TaskFormData): Promise<SimpleTask> {
    console.log('🚀 Creating task from form:', formData.title);

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('Not authenticated');
    }

    // Calculate end time based on duration
    const calculateEndTime = (startTime: string, durationMinutes: number) => {
      const [hours, minutes] = startTime.split(':').map(Number);
      const startMinutes = hours * 60 + minutes;
      const endMinutes = startMinutes + durationMinutes;
      const endHours = Math.floor(endMinutes / 60) % 24;
      const endMins = endMinutes % 60;
      return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
    };

    const endTime = calculateEndTime(formData.when.time, formData.durationMinutes);

    // Start with minimal required fields
    let taskData: any = {
      title: formData.title.trim(),
      date: formData.when.date,
      is_shared: formData.isShared,
      is_completed: false,
      created_by: user.user.id,
    };

    // Try to add common fields
    try {
      taskData.subtitle = formData.details?.trim() || null;
      taskData.emoji = formData.emoji || '✨';
      taskData.time = formData.when.time;
      taskData.end_time = endTime;
      taskData.assigned_to = [user.user.id];
      taskData.subtasks = formData.subtasks || [];
      taskData.alerts = formData.alerts || [];
      taskData.frequency = formData.recurrence.frequency === 'none' ? 'once' : formData.recurrence.frequency;
      // Store the full recurrence object for enhanced data
      taskData.recurrence = formData.recurrence;
    } catch (e) {
      // Continue with basic fields
      console.log('⚠️ Failed to add extended fields:', e);
    }

    let { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();

    // If we get a column error, try with even more basic fields
    if (error && error.message.includes('column') && error.message.includes('schema cache')) {
      console.log('⚠️ Some database columns missing, trying with minimal fields...');
      
      taskData = {
        title: formData.title.trim(),
        date: formData.when.date,
        is_shared: formData.isShared,
        is_completed: false,
        created_by: user.user.id,
      };

      const result = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('❌ Task creation failed:', error);
      
      // Provide helpful message for database schema issues
      if (error.message.includes('column') && error.message.includes('schema cache')) {
        throw new Error(`Database schema needs to be updated. Please run the SQL commands from database-schema.sql in your Supabase dashboard. Original error: ${error.message}`);
      }
      
      throw new Error(`Failed to create task: ${error.message}`);
    }

    console.log('✅ Task created successfully:', data.id, 'for date:', formData.when.date);
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

  // Update subtasks for a task
  async updateSubtasks(taskId: string, subtasks: { id: string; title: string; completed: boolean }[]): Promise<void> {
    console.log('📝 Updating subtasks for task:', taskId);

    const { error } = await supabase
      .from('tasks')
      .update({ subtasks })
      .eq('id', taskId);

    if (error) {
      console.error('❌ Subtask update failed:', error);
      throw new Error(`Failed to update subtasks: ${error.message}`);
    }

    console.log('✅ Subtasks updated');
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
    console.log('🔄 Mapping database task:', JSON.stringify(dbTask, null, 2));
    
    const mappedTask = {
      id: dbTask.id,
      title: dbTask.title || 'Untitled Task',
      subtitle: dbTask.subtitle || undefined,
      emoji: dbTask.emoji || '✨',
      time: dbTask.time || undefined,
      endTime: dbTask.end_time || undefined,
      date: dbTask.date,
      isShared: dbTask.is_shared || false,
      isCompleted: dbTask.is_completed || false,
      category: dbTask.category || 'Personal',
      priority: dbTask.priority || 'medium',
      frequency: dbTask.frequency || 'once',
      alerts: Array.isArray(dbTask.alerts) ? dbTask.alerts : [],
      assignedTo: Array.isArray(dbTask.assigned_to) ? dbTask.assigned_to : [],
      reactions: [],
      subtasks: Array.isArray(dbTask.subtasks) ? dbTask.subtasks : [],
      recurrence: dbTask.recurrence && typeof dbTask.recurrence === 'object' ? {
        frequency: dbTask.recurrence.frequency || (dbTask.frequency === 'once' ? 'none' : dbTask.frequency || 'none'),
        interval: dbTask.recurrence.interval || 1,
        daysOfWeek: dbTask.recurrence.daysOfWeek || [],
      } : {
        frequency: dbTask.frequency === 'once' ? 'none' : dbTask.frequency || 'none',
        interval: 1,
        daysOfWeek: [],
      },
    };
    
    console.log('✅ Mapped task result:', JSON.stringify(mappedTask, null, 2));
    return mappedTask;
  }
}

export default new SupabaseTaskService();