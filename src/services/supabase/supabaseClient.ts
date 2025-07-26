// src/services/supabase/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types'; // Generated from Supabase CLI

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// src/services/supabase/authService.ts
import { supabase } from './supabaseClient';
import { LoginCredentials, SignupCredentials, User } from '../../types/auth';

class SupabaseAuthService {
  async signUp(credentials: SignupCredentials): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('User creation failed');

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: credentials.email,
        name: credentials.name,
        partner_code: this.generatePartnerCode(),
      });

    if (profileError) throw profileError;

    return this.mapSupabaseUser(data.user, credentials.name);
  }

  async signIn(credentials: LoginCredentials): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Sign in failed');

    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw profileError;

    return this.mapSupabaseUser(data.user, profile.name, profile.partner_id);
  }

  async signInWithGoogle(): Promise<User> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) throw error;
    // Handle OAuth flow...
    throw new Error('OAuth flow needs platform-specific handling');
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) return null;

    return this.mapSupabaseUser(user, profile.name, profile.partner_id);
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async linkPartner(partnerCode: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    // Find partner by code
    const { data: partner, error: findError } = await supabase
      .from('profiles')
      .select('id')
      .eq('partner_code', partnerCode)
      .single();

    if (findError || !partner) throw new Error('Partner not found');

    // Create partnership
    const { error } = await supabase
      .from('partnerships')
      .insert({
        user1_id: user.id,
        user2_id: partner.id,
        status: 'pending',
      });

    if (error) throw error;

    // Update both profiles (you might want to do this via a Supabase function)
    await supabase
      .from('profiles')
      .update({ partner_id: partner.id })
      .eq('id', user.id);
  }

  private generatePartnerCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private mapSupabaseUser(supabaseUser: any, name: string, partnerId?: string): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      name,
      partnerId,
      createdAt: new Date(supabaseUser.created_at),
      updatedAt: new Date(),
    };
  }
}

export default new SupabaseAuthService();

// src/services/supabase/taskService.ts
import { supabase } from './supabaseClient';
import { EnhancedTask, TaskGroup } from '../../types/tasks';

class SupabaseTaskService {
  async createTask(task: Omit<EnhancedTask, 'id' | 'reactions'>): Promise<EnhancedTask> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        subtitle: task.subtitle,
        emoji: task.emoji,
        time: task.time,
        end_time: task.endTime,
        date: task.date,
        is_shared: task.isShared,
        assigned_to: task.assignedTo.length > 0 ? task.assignedTo : [user.user.id],
        category: task.category,
        priority: task.priority,
        group_id: task.groupId,
        created_by: user.user.id,
      })
      .select('*')
      .single();

    if (error) throw error;

    return this.mapDatabaseTask(data);
  }

  async getTasks(dateRange?: { start: string; end: string }): Promise<EnhancedTask[]> {
    let query = supabase
      .from('tasks')
      .select(`
        *,
        task_reactions (
          emoji,
          user_id,
          profiles!task_reactions_user_id_fkey (name)
        )
      `);

    if (dateRange) {
      query = query
        .gte('date', dateRange.start)
        .lte('date', dateRange.end);
    }

    const { data, error } = await query.order('date', { ascending: true });

    if (error) throw error;

    return data.map(this.mapDatabaseTask);
  }

  async updateTask(taskId: string, updates: Partial<EnhancedTask>): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update({
        title: updates.title,
        subtitle: updates.subtitle,
        is_completed: updates.isCompleted,
        progress: updates.progress,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId);

    if (error) throw error;
  }

  async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  }

  async addReaction(taskId: string, emoji: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('task_reactions')
      .upsert({
        task_id: taskId,
        user_id: user.user.id,
        emoji: emoji,
      });

    if (error) throw error;
  }

  async removeReaction(taskId: string, emoji: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('task_reactions')
      .delete()
      .eq('task_id', taskId)
      .eq('user_id', user.user.id)
      .eq('emoji', emoji);

    if (error) throw error;
  }

  // Real-time subscriptions
  subscribeToTasks(callback: (tasks: EnhancedTask[]) => void) {
    return supabase
      .channel('tasks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        () => {
          // Refetch tasks when changes occur
          this.getTasks().then(callback);
        }
      )
      .subscribe();
  }

  subscribeToTaskReactions(callback: () => void) {
    return supabase
      .channel('task_reactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_reactions',
        },
        callback
      )
      .subscribe();
  }

  private mapDatabaseTask(dbTask: any): EnhancedTask {
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
      assignedTo: dbTask.assigned_to,
      category: dbTask.category,
      groupId: dbTask.group_id,
      priority: dbTask.priority,
      progress: dbTask.progress,
      reactions: (dbTask.task_reactions || []).map((reaction: any) => ({
        emoji: reaction.emoji,
        count: 1, // You'd need to aggregate this
        isFromPartner: reaction.user_id !== dbTask.created_by,
        users: [reaction.user_id],
      })),
    };
  }
}

export default new SupabaseTaskService();

// src/hooks/useRealTimeTasks.ts
import { useState, useEffect } from 'react';
import { EnhancedTask } from '../types/tasks';
import SupabaseTaskService from '../services/supabase/taskService';

export const useRealTimeTasks = () => {
  const [tasks, setTasks] = useState<EnhancedTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    SupabaseTaskService.getTasks()
      .then(setTasks)
      .finally(() => setLoading(false));

    // Subscribe to real-time updates
    const subscription = SupabaseTaskService.subscribeToTasks(setTasks);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { tasks, loading };
};