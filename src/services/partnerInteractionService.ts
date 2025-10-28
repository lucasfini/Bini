// Partner Interaction Service for Supabase integration
import { supabase } from '../config/supabase';
import { 
  SerendipityBurst, 
  CooperativeQuest, 
  QuestStep,
  HeartbeatSyncState,
  SynchroBeatState 
} from '../types/partnerInteraction';

export class PartnerInteractionService {
  // Partner Status Methods
  static async updatePartnerStatus(userId: string, updates: {
    heartbeatActive?: boolean;
    currentBpm?: number;
    chargeLevel?: number;
    isOnline?: boolean;
    connectionStrength?: number;
  }) {
    const { data, error } = await supabase
      .from('partner_status')
      .upsert({
        user_id: userId,
        heartbeat_active: updates.heartbeatActive,
        current_bpm: updates.currentBpm,
        charge_level: updates.chargeLevel,
        is_online: updates.isOnline,
        connection_strength: updates.connectionStrength,
        last_activity: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    return data?.[0];
  }

  static async getPartnerStatus(partnerId: string) {
    const { data, error } = await supabase
      .from('partner_status')
      .select('*')
      .eq('user_id', partnerId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // SynchroBeat Methods
  static async createSynchroSession(initiatorId: string, partnerId: string) {
    const { data, error } = await supabase
      .from('synchro_sessions')
      .insert({
        initiator_id: initiatorId,
        partner_id: partnerId,
        status: 'preparing',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateSynchroSession(sessionId: string, updates: {
    status?: 'preparing' | 'counting' | 'breathing' | 'complete' | 'cancelled';
    completedAt?: string;
    durationSeconds?: number;
    syncQuality?: 'poor' | 'good' | 'excellent';
  }) {
    const { data, error } = await supabase
      .from('synchro_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getActiveSynchroSession(userId: string, partnerId: string) {
    const { data, error } = await supabase
      .from('synchro_sessions')
      .select('*')
      .or(`and(initiator_id.eq.${userId},partner_id.eq.${partnerId}),and(initiator_id.eq.${partnerId},partner_id.eq.${userId})`)
      .in('status', ['preparing', 'counting', 'breathing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // Serendipity Burst Methods
  static async createSerendipityBurst(fromUser: string, toUser: string, burst: {
    type: 'photo' | 'message' | 'location' | 'achievement';
    content: any;
    emotion?: string;
  }) {
    const { data, error } = await supabase
      .from('serendipity_bursts')
      .insert({
        from_user: fromUser,
        to_user: toUser,
        type: burst.type,
        content: burst.content,
        emotion: burst.emotion,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getSerendipityBursts(userId: string, partnerId: string, limit = 50) {
    const { data, error } = await supabase
      .from('serendipity_bursts')
      .select('*')
      .or(`and(from_user.eq.${userId},to_user.eq.${partnerId}),and(from_user.eq.${partnerId},to_user.eq.${userId})`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data?.map(burst => ({
      id: burst.id,
      type: burst.type,
      content: burst.content,
      timestamp: new Date(burst.created_at),
      fromPartner: burst.from_user === partnerId,
      isNew: !burst.is_read && burst.to_user === userId,
      emotion: burst.emotion,
    })) || [];
  }

  static async markBurstAsRead(burstId: string) {
    const { data, error } = await supabase
      .rpc('mark_burst_as_read', { burst_id: burstId });

    if (error) throw error;
    return data;
  }

  // Cooperative Quest Methods
  static async createCooperativeQuest(quest: {
    title: string;
    description: string;
    userId: string;
    partnerId: string;
    reward: string;
    deadline?: Date;
    steps: Array<{
      title: string;
      description: string;
      assignedTo: 'user' | 'partner' | 'both';
      requiresBoth: boolean;
    }>;
  }) {
    // Create the quest
    const { data: questData, error: questError } = await supabase
      .from('cooperative_quests')
      .insert({
        title: quest.title,
        description: quest.description,
        user_id: quest.userId,
        partner_id: quest.partnerId,
        reward: quest.reward,
        deadline: quest.deadline?.toISOString(),
      })
      .select()
      .single();

    if (questError) throw questError;

    // Create the quest steps
    if (quest.steps.length > 0) {
      const { data: stepsData, error: stepsError } = await supabase
        .from('quest_steps')
        .insert(
          quest.steps.map(step => ({
            quest_id: questData.id,
            title: step.title,
            description: step.description,
            assigned_to: step.assignedTo,
            requires_both: step.requiresBoth,
          }))
        )
        .select();

      if (stepsError) throw stepsError;

      // Return quest with steps
      return {
        ...questData,
        steps: stepsData,
      };
    }

    return questData;
  }

  static async getCooperativeQuests(userId: string, partnerId: string) {
    const { data, error } = await supabase
      .from('cooperative_quests')
      .select(`
        *,
        quest_steps (*)
      `)
      .or(`and(user_id.eq.${userId},partner_id.eq.${partnerId}),and(user_id.eq.${partnerId},partner_id.eq.${userId})`)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(quest => ({
      id: quest.id,
      title: quest.title,
      description: quest.description,
      reward: quest.reward,
      deadline: quest.deadline ? new Date(quest.deadline) : undefined,
      progress: quest.progress,
      isActive: quest.is_active,
      createdAt: new Date(quest.created_at),
      steps: quest.quest_steps?.map((step: any) => ({
        id: step.id,
        title: step.title,
        description: step.description,
        assignedTo: step.assigned_to,
        requiresBoth: step.requires_both,
        isCompleted: step.is_completed,
        completedBy: step.completed_by,
        completedAt: step.completed_at ? new Date(step.completed_at) : undefined,
      })) || [],
    })) || [];
  }

  static async completeQuestStep(stepId: string, userId: string) {
    const { data, error } = await supabase
      .from('quest_steps')
      .update({
        is_completed: true,
        completed_by: userId,
        completed_at: new Date().toISOString(),
      })
      .eq('id', stepId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Real-time subscription methods
  static subscribeToPartnerStatus(partnerId: string, callback: (status: any) => void) {
    return supabase
      .channel('partner-status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'partner_status',
          filter: `user_id=eq.${partnerId}`,
        },
        callback
      )
      .subscribe();
  }

  static subscribeToSerendipityBursts(userId: string, callback: (burst: any) => void) {
    return supabase
      .channel('serendipity-bursts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'serendipity_bursts',
          filter: `to_user=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }

  static subscribeToSynchroSessions(userId: string, partnerId: string, callback: (session: any) => void) {
    return supabase
      .channel('synchro-sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'synchro_sessions',
        },
        (payload) => {
          // Filter for sessions involving this user pair
          const session = payload.new || payload.old;
          if (
            session && 
            typeof session === 'object' &&
            'initiator_id' in session &&
            'partner_id' in session &&
            (
              (session.initiator_id === userId && session.partner_id === partnerId) ||
              (session.initiator_id === partnerId && session.partner_id === userId)
            )
          ) {
            callback(payload);
          }
        }
      )
      .subscribe();
  }

  static subscribeToCooperativeQuests(userId: string, partnerId: string, callback: (quest: any) => void) {
    return supabase
      .channel('cooperative-quests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cooperative_quests',
        },
        (payload) => {
          // Filter for quests involving this user pair
          const quest = payload.new || payload.old;
          if (
            quest && 
            typeof quest === 'object' &&
            'user_id' in quest &&
            'partner_id' in quest &&
            (
              (quest.user_id === userId && quest.partner_id === partnerId) ||
              (quest.user_id === partnerId && quest.partner_id === userId)
            )
          ) {
            callback(payload);
          }
        }
      )
      .subscribe();
  }

  // Utility methods
  static async testConnection() {
    try {
      const { data, error } = await supabase
        .from('partner_status')
        .select('count')
        .limit(1);

      if (error && error.code === 'PGRST116') {
        // Table doesn't exist yet - this is expected during development
        console.log('✅ Supabase connection works (tables not created yet)');
        return true;
      }

      if (error) {
        console.error('❌ Supabase connection error:', error);
        return false;
      }

      console.log('✅ Supabase connection and tables working');
      return true;
    } catch (error) {
      console.error('❌ Supabase connection failed:', error);
      return false;
    }
  }

  // Cleanup method for removing subscriptions
  static removeSubscription(subscription: any) {
    return supabase.removeChannel(subscription);
  }
}