import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PartnerInteractionState, 
  PartnerInteractionActions,
  HeartbeatSyncState,
  SynchroBeatState,
  SerendipityBurst,
  CooperativeQuest 
} from '../types/partnerInteraction';
import { usePartnerInteractionStore } from '../stores/partnerInteractionStore';
import { useFeatureFlags } from './FeatureFlagsProvider';
import { supabase } from '../config/supabase';
import { PartnerInteractionService } from '../services/partnerInteractionService';

interface PartnerInteractionContextType extends PartnerInteractionState, PartnerInteractionActions {}

const PartnerInteractionContext = createContext<PartnerInteractionContextType | undefined>(undefined);

interface PartnerInteractionProviderProps {
  children: ReactNode;
  userId: string;
  partnerId?: string;
}

export function PartnerInteractionProvider({ 
  children, 
  userId, 
  partnerId 
}: PartnerInteractionProviderProps) {
  const { isFeatureEnabled } = useFeatureFlags();
  const store = usePartnerInteractionStore();
  const queryClient = useQueryClient();

  // Real-time partner status
  const { data: partnerStatus } = useQuery({
    queryKey: ['partner-status', partnerId],
    queryFn: async () => {
      if (!partnerId || !isFeatureEnabled('heartbeatSync')) return null;
      return await PartnerInteractionService.getPartnerStatus(partnerId);
    },
    enabled: !!partnerId && isFeatureEnabled('heartbeatSync'),
    refetchInterval: 30000, // 30s
  });

  // Serendipity bursts query
  const { data: serendipityBursts = [] } = useQuery({
    queryKey: ['serendipity-bursts', userId, partnerId],
    queryFn: async () => {
      if (!partnerId || !isFeatureEnabled('serendipityBursts')) return [];
      return await PartnerInteractionService.getSerendipityBursts(userId, partnerId);
    },
    enabled: !!partnerId && isFeatureEnabled('serendipityBursts'),
  });

  // Cooperative quests query
  const { data: cooperativeQuests = [] } = useQuery({
    queryKey: ['cooperative-quests', userId, partnerId],
    queryFn: async () => {
      if (!partnerId || !isFeatureEnabled('cooperativeQuests')) return [];
      return await PartnerInteractionService.getCooperativeQuests(userId, partnerId);
    },
    enabled: !!partnerId && isFeatureEnabled('cooperativeQuests'),
  });

  // Heartbeat sync mutations
  const startHeartbeatSyncMutation = useMutation({
    mutationFn: async () => {
      if (!isFeatureEnabled('heartbeatSync')) throw new Error('Feature disabled');
      
      // Start heartbeat monitoring logic here
      store.setHeartbeatActive(true);
      
      // Update database
      await PartnerInteractionService.updatePartnerStatus(userId, {
        heartbeatActive: true,
        isOnline: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-status'] });
    },
  });

  // SynchroBeat mutations
  const startSynchroBeatMutation = useMutation({
    mutationFn: async () => {
      if (!partnerId || !isFeatureEnabled('synchroBeat')) throw new Error('Feature disabled or no partner');
      
      store.setSynchroBeatStage('preparing');
      
      // Create synchro session
      await PartnerInteractionService.createSynchroSession(userId, partnerId);
    },
  });

  // Serendipity burst mutation
  const sendSerendipityBurstMutation = useMutation({
    mutationFn: async ({ type, content }: { type: SerendipityBurst['type'], content: any }) => {
      if (!partnerId || !isFeatureEnabled('serendipityBursts')) throw new Error('Feature disabled or no partner');
      
      await PartnerInteractionService.createSerendipityBurst(userId, partnerId, {
        type,
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serendipity-bursts'] });
    },
  });

  // Quest mutations
  const createQuestMutation = useMutation({
    mutationFn: async (quest: Omit<CooperativeQuest, 'id' | 'createdAt' | 'progress'>) => {
      if (!partnerId || !isFeatureEnabled('cooperativeQuests')) throw new Error('Feature disabled or no partner');
      
      await PartnerInteractionService.createCooperativeQuest({
        title: quest.title,
        description: quest.description,
        reward: quest.reward,
        userId,
        partnerId,
        deadline: quest.deadline,
        steps: quest.steps.map(step => ({
          title: step.title,
          description: step.description,
          assignedTo: step.assignedTo,
          requiresBoth: step.requiresBoth,
        })),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cooperative-quests'] });
    },
  });

  // Real-time subscriptions
  useEffect(() => {
    if (!partnerId) return;

    const channel = supabase
      .channel('partner-interactions')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'serendipity_bursts',
          filter: `to_user=eq.${userId}`
        }, 
        () => {
          queryClient.invalidateQueries({ queryKey: ['serendipity-bursts'] });
        }
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'synchro_sessions',
          filter: `partner_id=eq.${userId}`
        },
        (payload) => {
          if (payload.new && payload.new.status === 'preparing') {
            store.setSynchroBeatStage('preparing');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [partnerId, userId, queryClient, store]);

  // Context value
  const contextValue: PartnerInteractionContextType = {
    // State
    heartbeatSync: store.heartbeatSync,
    synchroBeat: store.synchroBeat,
    serendipityBursts: serendipityBursts,
    cooperativeQuests: cooperativeQuests,
    isPartnerOnline: partnerStatus?.is_online || false,
    lastPartnerActivity: partnerStatus?.last_activity ? new Date(partnerStatus.last_activity) : null,
    connectionStrength: store.connectionStrength,

    // Actions
    startHeartbeatSync: () => startHeartbeatSyncMutation.mutateAsync(),
    stopHeartbeatSync: () => store.setHeartbeatActive(false),
    updateChargeLevel: (level: number) => store.setChargeLevel(level),
    
    startSynchroBeat: () => startSynchroBeatMutation.mutateAsync(),
    joinSynchroBeat: async () => {
      store.setSynchroBeatStage('counting');
    },
    
    sendSerendipityBurst: (type, content) => sendSerendipityBurstMutation.mutateAsync({ type, content }),
    markSerendipityAsRead: (id: string) => {
      // Update local state or make API call
    },
    
    createQuest: (quest) => createQuestMutation.mutateAsync(quest),
    completeQuestStep: async (questId: string, stepId: string) => {
      await PartnerInteractionService.completeQuestStep(stepId, userId);
      queryClient.invalidateQueries({ queryKey: ['cooperative-quests'] });
    },
    
    refreshPartnerStatus: async () => {
      queryClient.invalidateQueries({ queryKey: ['partner-status'] });
    },
  };

  return (
    <PartnerInteractionContext.Provider value={contextValue}>
      {children}
    </PartnerInteractionContext.Provider>
  );
}

export function usePartnerInteraction(): PartnerInteractionContextType {
  const context = useContext(PartnerInteractionContext);
  if (context === undefined) {
    throw new Error('usePartnerInteraction must be used within a PartnerInteractionProvider');
  }
  return context;
}