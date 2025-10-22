// src/services/tasks/unifiedTaskService.ts - FIXED FOR STRING JSON FIELDS
import { supabase } from '../../config/supabase';
import { UnifiedTask, TaskFormData } from '../../types/tasks';
import { getLocalDateISO } from '../../utils/dateHelper';

class UnifiedTaskService {
  // Helper to calculate end time
  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + durationMinutes;
    const endHours = Math.floor(endMinutes / 60) % 24;
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins
      .toString()
      .padStart(2, '0')}`;
  }

  // Helper to safely parse JSON strings from database
  private parseJsonString(value: any): any {
    if (value === null || value === undefined) {
      return null;
    }

    // If it's already an object/array, return as is
    if (typeof value === 'object') {
      return value;
    }

    // If it's a string, try to parse it as JSON
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (error) {
        console.warn('Failed to parse JSON string:', value, error);
        return null;
      }
    }

    return value;
  }

  // Convert form data to unified task
  private formToUnified(
    formData: TaskFormData,
    userId: string,
  ): Partial<UnifiedTask> {
    const endTime = this.calculateEndTime(
      formData.when.time,
      formData.durationMinutes,
    );

    return {
      title: formData.title.trim(),
      emoji: formData.emoji,
      startTime: formData.when.time, // PRIMARY FIELD
      endTime: endTime, // PRIMARY FIELD
      date: formData.when.date,
      isShared: formData.isShared,
      isCompleted: false,
      createdBy: userId,
      duration: formData.durationMinutes,
      details: formData.details.trim() || undefined, // PRIMARY FIELD
      steps: formData.subtasks.map(subtask => ({
        // PRIMARY FIELD
        id: subtask.id,
        title: subtask.title.trim(),
        completed: subtask.completed,
      })),
      recurrence: formData.recurrence, // PRIMARY FIELD
      alerts: formData.alerts,
      assignedTo: [userId],
      category: 'Personal',
      priority: 'medium' as const,

      // Backward compatibility aliases (for existing Timeline code)
      time: formData.when.time, // DEPRECATED: maps to startTime
      subtitle: formData.details, // DEPRECATED: maps to details
      subtasks: formData.subtasks, // DEPRECATED: maps to steps
    };
  }

  // Convert database row to unified task
  private dbToUnified(dbTask: any): UnifiedTask {
    // Parse JSON string fields from database
    const steps =
      this.parseJsonString(dbTask.steps) ||
      this.parseJsonString(dbTask.subtasks) ||
      [];
    const alerts = this.parseJsonString(dbTask.alerts) || [];
    const assignedTo = this.parseJsonString(dbTask.assigned_to) || [];
    const recurrenceData = this.parseJsonString(dbTask.reoccurrence) ||
      this.parseJsonString(dbTask.recurrence) || {
        frequency: 'none',
        interval: 1,
        daysOfWeek: [],
      };

    console.log('🔄 Parsing task:', dbTask.id);
    console.log('📋 Parsed steps:', steps);
    console.log('🔔 Parsed alerts:', alerts);
    console.log('👥 Parsed assignedTo:', assignedTo);

    return {
      id: dbTask.id,
      title: dbTask.title || 'Untitled Task',
      emoji: dbTask.emoji || '✨',
      date: dbTask.date,
      isShared: dbTask.is_shared || false,
      isCompleted: dbTask.is_completed || false,
      createdBy: dbTask.created_by,

      // PRIMARY FIELDS (use these in new code)
      startTime: dbTask.start_time || dbTask.time || 'TODO',
      endTime: dbTask.end_time || dbTask.endTime,
      duration: dbTask.duration,
      details: dbTask.details || dbTask.subtitle,
      steps: Array.isArray(steps) ? steps : [],
      recurrence: recurrenceData,

      // BACKWARD COMPATIBILITY (for existing Timeline code)
      time: dbTask.start_time || dbTask.time || 'TODO',
      subtitle: dbTask.details || dbTask.subtitle,
      subtasks: Array.isArray(steps) ? steps : [],

      // Other fields
      alerts: Array.isArray(alerts) ? alerts : [],
      assignedTo: Array.isArray(assignedTo) ? assignedTo : [],
      category: dbTask.category || 'Personal',
      priority: dbTask.priority || 'medium',
      reactions: [],
      groupId: dbTask.group_id,
    };
  }

  // Create task from form
  async createTaskFromForm(formData: TaskFormData): Promise<UnifiedTask> {
    console.log('🚀 Creating unified task:', formData.title);

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const unifiedTask = this.formToUnified(formData, user.user.id);

    // Map to database schema - store JSON as strings since that's how your DB is set up
    const dbData = {
      title: unifiedTask.title,
      emoji: unifiedTask.emoji,
      start_time: unifiedTask.startTime,
      end_time: unifiedTask.endTime,
      date: unifiedTask.date,
      is_shared: unifiedTask.isShared,
      is_completed: unifiedTask.isCompleted,
      created_by: unifiedTask.createdBy,
      duration: unifiedTask.duration,
      details: unifiedTask.details,
      steps: JSON.stringify(unifiedTask.steps || []), // Store as JSON string
      reoccurrence: JSON.stringify(
        unifiedTask.recurrence || { frequency: 'none', interval: 1, daysOfWeek: [] },
      ),
      alerts: JSON.stringify(unifiedTask.alerts || []), // Store as JSON string
      assigned_to: JSON.stringify(unifiedTask.assignedTo || []), // Store as JSON string
      category: unifiedTask.category,
      priority: unifiedTask.priority,
    };

    console.log('📋 Database data:', JSON.stringify(dbData, null, 2));

    const { data, error } = await supabase
      .from('tasks')
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error('❌ Task creation failed:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      throw new Error(`Failed to create task: ${error.message}`);
    }

    console.log('✅ Task created successfully:', data.id);
    console.log('📊 Created task data from DB:', JSON.stringify(data, null, 2));
    
    // VERIFY: Check if we can immediately find this task
    const { data: verifyData, error: verifyError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', data.id)
      .single();
    
    if (verifyError) {
      console.error('❌ Could not verify task creation:', verifyError);
    } else {
      console.log('✅ Task verification successful:', verifyData.id);
    }

    return this.dbToUnified(data);
  }

  // Get tasks for timeline - FIXED QUERY
  async getTasksForTimeline(): Promise<Record<string, UnifiedTask[]>> {
    console.log('🔍 Fetching tasks for timeline...');

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      console.log('❌ No user found');
      throw new Error('Not authenticated');
    }

    // Use local timezone to get correct date boundaries
    const today = new Date();
    const pastWeek = new Date();
    pastWeek.setDate(today.getDate() - 7); // Get past week for navigation
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    // Convert to local date strings (not UTC)
    const pastWeekLocal = getLocalDateISO(pastWeek);
    const nextWeekLocal = getLocalDateISO(nextWeek);

    console.log(
      '📅 Fetching tasks from',
      pastWeekLocal,
      'to',
      nextWeekLocal,
    );
    console.log('👤 User ID:', user.user.id);

    try {
      // DEBUG: Let's first see if any tasks exist at all
      console.log('🔍 Checking for any tasks in database...');
      const { data: allTasks, error: allError } = await supabase
        .from('tasks')
        .select('*')
        .limit(10);

      console.log('📊 Total tasks in database:', allTasks?.length || 0);
      if (allTasks && allTasks.length > 0) {
        console.log('📋 Sample task:', JSON.stringify(allTasks[0], null, 2));
      }

      // SIMPLIFIED QUERY: Get tasks for past week to next week using local timezone
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('created_by', user.user.id)
        .gte('date', pastWeekLocal)
        .lte('date', nextWeekLocal)
        .order('date', { ascending: true });

      if (error) {
        console.error('❌ Supabase query error:', error);
        throw new Error(`Failed to fetch tasks: ${error.message}`);
      }

      console.log('📊 Raw database result:', data?.length || 0, 'tasks');

      if (!data || data.length === 0) {
        console.log('📭 No tasks found');
        return {};
      }

      // Group by timeline keys with error handling
      const grouped: Record<string, UnifiedTask[]> = {};

      data.forEach((task, index) => {
        try {
          console.log(`🔄 Processing task ${index + 1}:`, task.id, task.title);
          const dateKey = task.date; // Use the actual ISO date string directly
          if (!grouped[dateKey]) grouped[dateKey] = [];

          const unifiedTask = this.dbToUnified(task);
          grouped[dateKey].push(unifiedTask);
          console.log(`✅ Task processed successfully:`, unifiedTask.id);
        } catch (taskError) {
          console.error(`❌ Error processing task ${task.id}:`, taskError);
          // Continue with other tasks instead of failing completely
        }
      });

      console.log(
        '📋 Final grouped result:',
        Object.keys(grouped).length,
        'date groups',
      );
      Object.keys(grouped).forEach(key => {
        console.log(`📅 ${key}: ${grouped[key].length} tasks`);
      });

      return grouped;
    } catch (error) {
      console.error('❌ Timeline fetch error:', error);
      throw error;
    }
  }

  private convertDateToTimelineKey(dateString: string): string {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    if (dateString === today) return 'today';
    if (dateString === tomorrowStr) return 'tomorrow';
    return dateString; // Use actual date for other days
  }

  // Toggle task completion
  async toggleTaskCompletion(taskId: string): Promise<boolean> {
    console.log('🔄 Toggling task completion:', taskId);

    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('is_completed')
      .eq('id', taskId)
      .single();

    if (fetchError) {
      console.error('❌ Failed to fetch task for toggle:', fetchError);
      throw new Error(`Failed to fetch task: ${fetchError.message}`);
    }

    const newState = !task.is_completed;

    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: newState })
      .eq('id', taskId);

    if (error) {
      console.error('❌ Failed to update task completion:', error);
      throw new Error(`Failed to toggle task: ${error.message}`);
    }

    console.log('✅ Task completion toggled to:', newState);
    return newState;
  }

  // Update steps
  async updateSteps(
    taskId: string,
    steps: Array<{ id: string; title: string; completed: boolean }>,
  ): Promise<void> {
    console.log('📝 Updating steps for task:', taskId);

    const { error } = await supabase
      .from('tasks')
      .update({ steps: JSON.stringify(steps || []) }) // Store as JSON string
      .eq('id', taskId);

    if (error) {
      console.error('❌ Failed to update steps:', error);
      throw new Error(`Failed to update steps: ${error.message}`);
    }

    console.log('✅ Steps updated successfully');
  }

  // Delete task
  async deleteTask(taskId: string): Promise<void> {
    console.log('🗑️ Deleting task:', taskId);

    const { error } = await supabase.from('tasks').delete().eq('id', taskId);

    if (error) {
      console.error('❌ Failed to delete task:', error);
      throw new Error(`Failed to delete task: ${error.message}`);
    }

    console.log('✅ Task deleted successfully');
  }
}

export default new UnifiedTaskService();
