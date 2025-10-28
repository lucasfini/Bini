// Partner Interaction Feature Types
export interface HeartbeatSyncState {
  isActive: boolean;
  chargeLevel: number; // 0-100
  lastSync: Date | null;
  partnerHeartRate?: number;
  userHeartRate?: number;
  syncQuality: 'poor' | 'good' | 'excellent';
}

export interface SynchroBeatState {
  isActive: boolean;
  countdown: number; // 15s countdown
  stage: 'idle' | 'preparing' | 'counting' | 'breathing' | 'complete';
  partnerConnected: boolean;
}

export interface SerendipityBurst {
  id: string;
  type: 'photo' | 'message' | 'location' | 'achievement';
  content: any;
  timestamp: Date;
  fromPartner: boolean;
  isNew: boolean;
  emotion?: string;
}

export interface CooperativeQuest {
  id: string;
  title: string;
  description: string;
  steps: QuestStep[];
  progress: number; // 0-100
  reward: string;
  createdAt: Date;
  deadline?: Date;
  isActive: boolean;
}

export interface QuestStep {
  id: string;
  title: string;
  description: string;
  assignedTo: 'user' | 'partner' | 'both';
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: Date;
  requiresBoth: boolean;
}

export interface PartnerInteractionState {
  heartbeatSync: HeartbeatSyncState;
  synchroBeat: SynchroBeatState;
  serendipityBursts: SerendipityBurst[];
  cooperativeQuests: CooperativeQuest[];
  isPartnerOnline: boolean;
  lastPartnerActivity: Date | null;
  connectionStrength: number; // 0-100
}

export interface PartnerInteractionActions {
  // Heartbeat Sync
  startHeartbeatSync: () => Promise<void>;
  stopHeartbeatSync: () => void;
  updateChargeLevel: (level: number) => void;
  
  // SynchroBeat
  startSynchroBeat: () => Promise<void>;
  joinSynchroBeat: () => Promise<void>;
  
  // Serendipity Bursts
  sendSerendipityBurst: (type: SerendipityBurst['type'], content: any) => Promise<void>;
  markSerendipityAsRead: (id: string) => void;
  
  // Cooperative Quests
  createQuest: (quest: Omit<CooperativeQuest, 'id' | 'createdAt' | 'progress'>) => Promise<void>;
  completeQuestStep: (questId: string, stepId: string) => Promise<void>;
  
  // General
  refreshPartnerStatus: () => Promise<void>;
}

export interface FeatureFlags {
  heartbeatSync: boolean;
  synchroBeat: boolean;
  serendipityBursts: boolean;
  cooperativeQuests: boolean;
  devShowcase: boolean;
}