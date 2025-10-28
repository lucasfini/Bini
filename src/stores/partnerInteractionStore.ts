import { create } from 'zustand';
import { HeartbeatSyncState, SynchroBeatState } from '../types/partnerInteraction';

interface PartnerInteractionStore {
  // Heartbeat Sync State
  heartbeatSync: HeartbeatSyncState;
  setHeartbeatActive: (active: boolean) => void;
  setChargeLevel: (level: number) => void;
  setHeartRates: (userRate: number, partnerRate?: number) => void;
  setSyncQuality: (quality: HeartbeatSyncState['syncQuality']) => void;
  
  // SynchroBeat State
  synchroBeat: SynchroBeatState;
  setSynchroBeatActive: (active: boolean) => void;
  setSynchroBeatCountdown: (countdown: number) => void;
  setSynchroBeatStage: (stage: SynchroBeatState['stage']) => void;
  setPartnerConnected: (connected: boolean) => void;
  
  // General
  connectionStrength: number;
  setConnectionStrength: (strength: number) => void;
  
  // Reset functions
  resetHeartbeatSync: () => void;
  resetSynchroBeat: () => void;
  resetAll: () => void;
}

const initialHeartbeatState: HeartbeatSyncState = {
  isActive: false,
  chargeLevel: 0,
  lastSync: null,
  userHeartRate: undefined,
  partnerHeartRate: undefined,
  syncQuality: 'poor',
};

const initialSynchroBeatState: SynchroBeatState = {
  isActive: false,
  countdown: 15,
  stage: 'idle',
  partnerConnected: false,
};

export const usePartnerInteractionStore = create<PartnerInteractionStore>((set, get) => ({
  // Initial state
  heartbeatSync: initialHeartbeatState,
  synchroBeat: initialSynchroBeatState,
  connectionStrength: 0,
  
  // Heartbeat Sync actions
  setHeartbeatActive: (active) =>
    set((state) => ({
      heartbeatSync: {
        ...state.heartbeatSync,
        isActive: active,
        lastSync: active ? new Date() : state.heartbeatSync.lastSync,
      },
    })),
  
  setChargeLevel: (level) =>
    set((state) => ({
      heartbeatSync: {
        ...state.heartbeatSync,
        chargeLevel: Math.max(0, Math.min(100, level)),
      },
    })),
  
  setHeartRates: (userRate, partnerRate) =>
    set((state) => ({
      heartbeatSync: {
        ...state.heartbeatSync,
        userHeartRate: userRate,
        partnerHeartRate: partnerRate,
        lastSync: new Date(),
        syncQuality: partnerRate 
          ? Math.abs(userRate - partnerRate) < 10 
            ? 'excellent' 
            : Math.abs(userRate - partnerRate) < 20 
            ? 'good' 
            : 'poor'
          : 'poor',
      },
    })),
  
  setSyncQuality: (quality) =>
    set((state) => ({
      heartbeatSync: {
        ...state.heartbeatSync,
        syncQuality: quality,
      },
    })),
  
  // SynchroBeat actions
  setSynchroBeatActive: (active) =>
    set((state) => ({
      synchroBeat: {
        ...state.synchroBeat,
        isActive: active,
        stage: active ? 'preparing' : 'idle',
        countdown: active ? 15 : 15,
      },
    })),
  
  setSynchroBeatCountdown: (countdown) =>
    set((state) => ({
      synchroBeat: {
        ...state.synchroBeat,
        countdown: Math.max(0, countdown),
      },
    })),
  
  setSynchroBeatStage: (stage) =>
    set((state) => ({
      synchroBeat: {
        ...state.synchroBeat,
        stage,
        isActive: stage !== 'idle',
        countdown: stage === 'counting' ? 15 : state.synchroBeat.countdown,
      },
    })),
  
  setPartnerConnected: (connected) =>
    set((state) => ({
      synchroBeat: {
        ...state.synchroBeat,
        partnerConnected: connected,
      },
    })),
  
  // General actions
  setConnectionStrength: (strength) =>
    set({ connectionStrength: Math.max(0, Math.min(100, strength)) }),
  
  // Reset functions
  resetHeartbeatSync: () =>
    set({ heartbeatSync: initialHeartbeatState }),
  
  resetSynchroBeat: () =>
    set({ synchroBeat: initialSynchroBeatState }),
  
  resetAll: () =>
    set({
      heartbeatSync: initialHeartbeatState,
      synchroBeat: initialSynchroBeatState,
      connectionStrength: 0,
    }),
}));